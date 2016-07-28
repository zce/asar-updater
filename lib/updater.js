/**
 * {
 *   "url": "https://github.com/atom/atom/releases/download/v1.4.3/atom-windows.zip",
 *   "name": "1.4.3",
 *   "notes": "### Notable Changes\r\n\r\n* Fixed a bug that caused...",
 *   "pub_date": "2016-02-02T21:51:58Z",
 *   "version": "1.4.3",
 *   "sha1": ""
 * }
 */
// process.versions.electron ? 'original-fs' :
const fs = require('fs')
const os = require('os')
const path = require('path')
const zlib = require('zlib')
const crypto = require('crypto')
const electron = require('electron')
const EventEmitter = require('events')
const got = require('got')
const semver = require('semver')

const app = electron.app || electron.remote.app

class Updater extends EventEmitter {
  constructor () {
    super()
    this.tasks = []
  }

  _fetchJson (url) {
    return got(url, { encoding: 'utf8', timeout: 1500, retries: 1, json: true, headers: this.headers })
      .then(response => Promise.resolve(response.body))
  }

  _fetchFile (url, name) {
    let onProgress = p => console.log(p)
    let total = 0
    let current = 0
    let timer = null
    const tempFile = path.resolve(this.options.cacheDirectory, name)
    const promise = new Promise((resolve, reject) => {
      got.stream(url, { encoding: 'utf8', timeout: 1500, retries: 1, headers: this.headers })
        .on('request', request => { timer = setTimeout(() => request && request.abort(), 2 * 60 * 1000) })
        .on('response', response => response.headers['content-length'] ? (total = parseInt(response.headers['content-length'], 10)) : onProgress(-1))
        .on('data', chunk => total ? onProgress((current += chunk.length) / total) : onProgress(-1))
        .on('end', chunk => clearTimeout(timer))
        .on('error', (error, body, response) => reject(error))
        .pipe(zlib.Gunzip())
        .pipe(fs.createWriteStream(tempFile))
        // .pipe(unzip.Extract({ path: this.folder }))
        .on('error', (error) => reject(error))
        .on('close', () => resolve(tempFile))
    })
    promise.progress = callback => {
      onProgress = callback
      return promise
    }
    return promise
  }

  init (options) {
    const def = {
      tmpdir: os.tmpdir(),
      headers: {},
      name: app.getName()
    }
    this.options = Object.assign({}, def, options)
    this.options.cacheDirectory = path.resolve(this.options.tmpdir, this.options.name)
    this.options.headers['user-agent'] = this.options.headers['user-agent'] || 'asar-updater/v0.0.1 (https://github.com/zce/asar-updater)'
    // TODO: mkdirp
    fs.existsSync(this.options.cacheDirectory) || fs.mkdirSync(this.options.cacheDirectory)
  }

  setFeedURL (filename, url) {
    if (!path.isAbsolute(filename)) {
      filename = path.resolve(app.getAppPath(), filename)
    }
    const name = path.basename(filename, '.asar')
    this.tasks.push({ name, filename, url })
  }

  checkForUpdates () {
    this.manifest = []
    this.emit('checking-for-update')
    Promise.all(
      this.tasks
        .map(t => this._local(t))
        .map(t => this._remote(t))
        .map(p => this._compare(p))
        .map(p => this._download(p))
    )
    .then(tasks => this._allCompleted(tasks))
    .catch(error => this.emit('error', error))
  }

  _local (task) {
    try {
      task.local = require(path.resolve(task.filename, 'package.json'))
      if (!task.local.version) throw new Error('There is no version in the package.json')
      return task
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') throw e
      throw new Error('There is no package.json in the ' + task.filename)
    }
  }

  _remote (task) {
    return this._fetchJson(task.url + '?v=' + Date.now())
      .then(remote => {
        task.remote = remote
        if (!task.remote.version) return Promise.reject(new Error('There is no version in the remote'))
        return task
      })
  }

  _compare (promise) {
    return promise.then(task => {
      task.available = semver.gt(semver.clean(task.remote.version), semver.clean(task.local.version))
      this.emit(task.available ? 'available' : 'not-available', task)
      return task
    })
  }

  _getFileStamp (filename, type) {
    type = type || 'sha1'
    const buffer = fs.readFileSync(filename)
    var hash = crypto.createHash(type)
    hash.update(buffer)
    return hash.digest('hex')
  }

  _download (promise) {
    return promise.then(task => {
      if (!task.available) return task
      return this._fetchFile(task.remote.url + '?v=' + Date.now(), task.name)
        .progress(p => this.emit('progress', task, p))
        .then(filename => {
          if (task.remote.sha1 === this._getFileStamp(filename)) {
            this.manifest.push({ from: filename, to: task.filename })
          }
          this.emit('downloaded', task)
          return task
        })
    })
  }

  _allCompleted (tasks) {
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (!tasks[i].available) {
        this.emit('completed', false, tasks)
        return
      }
    }
    fs.writeFile(path.resolve(this.options.cacheDirectory, 'manifest.json'), JSON.stringify(this.manifest), 'utf8', error => {
      if (error) return fs.unlink(this.options.cacheDirectory)
      this.emit('completed', this.manifest, tasks)
      this.manifest = []
    })
  }

  quitAndInstall () {
    setTimeout(() => {
      app.relaunch({ args: process.argv.slice(1) + ['--relaunch'] })
      app.exit(0)
    }, 100)
  }
}

module.exports = new Updater()
