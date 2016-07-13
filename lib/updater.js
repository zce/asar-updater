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
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { app } = require('electron')
const got = require('got')
const semver = require('semver')

/**
 * 抓取远端
 * @param  {[type]} url      [description]
 * @param  {[type]} options) [description]
 * @return {[type]}          [description]
 */
const fetchUrl = (url, options) => new Promise((resolve, reject) => {
  const def = { encoding: 'utf8', timeout: 1500 }
  got(url, Object.assign({}, def, options))
    .then(response => {
      resolve(response.body)
    })
    .catch(error => {
      console.log(error.response.body)
      reject(error)
    })
})

const fetchJson = (url, options) => fetchUrl(url, { json: true })

const fetchFile = (url, filename, options) => {
  let onProgress = p => console.log(p)
  const tempFile = path.resolve(cacheDir, filename)
  const def = {}

  const promise = new Promise((resolve, reject) => {
    let total = 0
    let current = 0
    let timer = null
    got.stream(url, Object.assign({}, def, options))
      .on('request', request => { timer = setTimeout(() => request && request.abort(), 2 * 60 * 1000) })
      .on('response', response => response.headers['content-length'] ? (total = parseInt(response.headers['content-length'], 10)) : onProgress(-1))
      .on('data', chunk => total ? onProgress((current += chunk.length) / total) : onProgress(-1))
      .on('end', chunk => clearTimeout(timer))
      .on('error', (error, body, response) => {
        console.log(error)
        reject(error)
      })
      .pipe(zlib.Gunzip())
      .pipe(fs.createWriteStream(tempFile))
      .on('close', () => resolve(tempFile))
  })

  promise.progress = callback => {
    onProgress = callback
    return promise
  }
  return promise
}

class Updater extends EventEmitter {

  constructor () {
    this.userAgent = `itcast-tms/${pkg.version} (https://github.com/zce/itcast-tms)`
    this.cacheDir = path.join(app.getPath('temp'), app.getName())
    fs.existsSync(this.cacheDir) || fs.mkdirSync(this.cacheDir)
  }

  init (options) {
    options.headers = Object.assign({ 'user-agent': this.userAgent }, options.headers)
    this.options = Object.assign({}, options)
    this.tasks = []
  }

  setFeedURL (filename, url) {
    if (!path.isAbsolute(filename)) {
      filename = path.join(app.getAppPath(), filename)
    }
    this.tasks.push({ filename, url })
  }

  checkForUpdates () {
    this.emit('checking-for-update')
    this.tasks.map(task => {
      try {
        task.local = require(path.join(task.filename, 'package.json'))
        if (!task.local.version) throw e
        return task
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e
      }
    })
    .map(task => {
      fetchJson(task.url, this.options)
        .then(remote => {
          task.remote = remote
          const available = semver.gt(semver.clean(task.remote.version), semver.clean(task.local.version))
          this.emit(available ? 'update-available' : 'update-not-available', task)

        })
        .catch(error => this.emit('error', error))
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
        fs.rename(tempFile, path.resolve(cacheDir, `../${filename}.asar`), error => {
          if (error) return reject(error)
          resolve(filename)
        })
 */
