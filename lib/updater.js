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
const EventEmitter = require('events')
const fs = process.versions.electron ? require('original-fs') : require('fs')
const os = require('os')
const path = require('path')
// const zlib = require('zlib')
const got = require('got')
const semver = require('semver')
const unzip = require('unzip')

class Updater extends EventEmitter {
  constructor () {
    super()
    this.headers = { 'user-agent': 'asar-updater/v0.0.1 (https://github.com/zce/asar-updater)' }
    this.tasks = []
  }

  _fetchJson (url) {
    return new Promise((resolve, reject) => {
      const def = { encoding: 'utf8', timeout: 1500, json: true }
      got(url, Object.assign(def, { headers: this.headers }))
        .then(response => { resolve(response.body) })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  _fetchFile (url) {
    let onProgress = p => console.log(p)
    const def = { timeout: 2 * 60 * 1000 }
    const promise = new Promise((resolve, reject) => {
      let total = 0
      let current = 0
      let timer = null
      got.stream(url, Object.assign(def, { headers: this.headers }))
        .on('request', request => { timer = setTimeout(() => request && request.abort(), def.timeout) })
        .on('response', response => response.headers['content-length'] ? (total = parseInt(response.headers['content-length'], 10)) : onProgress(-1))
        .on('data', chunk => total ? onProgress((current += chunk.length) / total) : onProgress(-1))
        .on('end', chunk => clearTimeout(timer))
        .on('error', (error, body, response) => {
          console.log(error)
          reject(error)
        })
        // .pipe(zlib.Gunzip())
        // .pipe(fs.createWriteStream(tempFile))
        .pipe(unzip.Extract({ path: this.folder }))
        .on('close', () => resolve(tempFile))
    })

    promise.progress = callback => {
      onProgress = callback
      return promise
    }
    return promise
  }

  init (folder, headers) {
    Object.assign(this.headers, headers)
    this.folder = path.join(os.tmpdir(), folder)
    // TODO: mkdirp
    fs.existsSync(this.folder) || fs.mkdirSync(this.folder)
  }

  setFeedURL (name, url) {
    name = path.basename(name)
    this.tasks.push({ name, url })
  }

  checkForUpdates () {
    this.emit('checking-for-update')
    // 读取每一个本地包的信息
    const temp = this.tasks.map(task => {
      try {
        task.local = require(path.resolve(path.dirname(module.parent.filename), task.name, 'package.json'))
        if (!task.local.version) throw new Error('There is no package.json in the ' + task.name)
        return task
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e
      }
    })
    .map(task => {
      return this._fetchJson(task.url, this.options)
        .then(remote => {
          task.remote = remote
          return task
        })
    })
    Promise.all(temp).then(tasks => {
      console.log(tasks)
    })
  }

  quitAndInstall () {

  }
}

module.exports = new Updater()

/**
 * Events
The autoUpdater object emits the following events:

Event: ‘error’
Returns:

error Error
Emitted when there is an error while updating.

Event: ‘checking-for-update’
Emitted when checking if an update has started.

Event: ‘update-available’
Emitted when there is an available update. The update is downloaded automatically.

Event: ‘update-not-available’
Emitted when there is no available update.

Event: ‘update-downloaded’
Returns:

event Event
releaseNotes String
releaseName String
releaseDate Date
updateURL String
Emitted when an update has been downloaded.

On Windows only releaseName is available.


        // 如果更新的是更新器，不能直接运行
        if (filename === 'updater') return resolve('updater_updated')
        fs.rename(tempFile, path.resolve(folder, `../${filename}.asar`), error => {
          if (error) return reject(error)
          resolve(filename)
        })
 */
    // const tasks = this.tasks.map(task => {
    //   try {
    //     task.local = require(path.join(task.filename, 'package.json'))
    //     if (!task.local.version) throw e
    //     return task
    //   } catch (e) {
    //     if (e.code !== 'MODULE_NOT_FOUND') throw e
    //   }
    // })
    // .map(task => {
    //   return fetchJson(task.url, this.options)
    //     .then(remote => {
    //       task.remote = remote
    //       return task
    //     })
    //     .then(task => {
    //       const available = semver.gt(semver.clean(task.remote.version), semver.clean(task.local.version))
    //       this.emit(available ? 'update-available' : 'update-not-available', task)
    //       if (available) {
    //         return fetchFile(task.remote.url, path.basename(task.filename), this.options)
    //       }
    //     })
    //     .catch(error => this.emit('error', error))
    // })
