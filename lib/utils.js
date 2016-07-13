/**
 * 基础操作工具
 */
const path = require('path')
const zlib = require('zlib')
const crypto = require('crypto')
const fs = process.versions.electron ? require('original-fs') : require('fs')
const got = require('got')

const pkg = require('../package.json')

// 临时目录
const cacheDir = path.resolve(__dirname, '../../cache/')
fs.existsSync(cacheDir) || fs.mkdirSync(cacheDir)
const userAgent = `itcast-tms/${pkg.version} (https://github.com/zce/itcast-tms)`

/**
 * 抓取远端
 * @param  {[type]} uri      [description]
 * @param  {[type]} options) [description]
 * @return {[type]}          [description]
 */
const fetchUrl = (uri, options) => new Promise((resolve, reject) => {
  const def = { encoding: 'utf8', headers: { 'user-agent': userAgent }, timeout: 1500 }
  Object.assign(def, options)
  got(uri, def)
    .then(response => {
      resolve(response.body)
    })
    .catch(error => {
      console.log(error.response.body)
      reject(error)
    })
})

const fetchJson = (uri, options) => fetchUrl(uri, { json: true })

const fetchFile = (uri, filename) => {
  let onProgress = p => console.log(p)
  const tempFile = path.resolve(cacheDir, filename)
  const def = { headers: { 'user-agent': userAgent } }

  const promise = new Promise((resolve, reject) => {
    let total = 0
    let current = 0
    let timer = null
    got.stream(uri, def)
      .on('request', request => { timer = setTimeout(() => request && request.abort(), 2 * 60 * 1000) })
      .on('response', response => {
        if (!response.headers['content-length']) return onProgress(-1)
        total = parseInt(response.headers['content-length'], 10)
      })
      .on('data', chunk => {
        total ? onProgress((current += chunk.length) / total) : onProgress(-1)
      })
      .on('end', chunk => {
        clearTimeout(timer)
      })
      .on('error', (error, body, response) => {
        console.log(error)
        reject(error)
      })
      .pipe(zlib.Gunzip())
      .pipe(fs.createWriteStream(tempFile))
      .on('close', () => {
        // 如果更新的是更新器，不能直接运行
        if (filename === 'updater') return resolve('updater_updated')
        fs.rename(tempFile, path.resolve(cacheDir, `../${filename}.asar`), error => {
          if (error) return reject(error)
          resolve(filename)
        })
      })
      // const interval = setInterval(() => {
      //   onProgress(new Date)
      // }, 1000)
      // setTimeout(() => {
      //   clearInterval(interval)
      //   resolve(new Date)
      // }, 5000)
  })

  promise.progress = callback => {
    onProgress = callback
    return promise
  }
  return promise
}

// let progress = p => console.log(p)
// const task = got.stream(uri)
// const to = fs.createWriteStream(path.resolve(__dirname, `../../${filename}.asar`))
// const promise = new Promise((resolve, reject) => {
//   task
//     .on('request', request => {
//       setTimeout(() => request.abort(), 0.02 * 60 * 1000)
//     })
//     .on('response', response => {
//       if (!response.headers['content-length']) return progress(-1)
//       const total = parseInt(response.headers['content-length'], 10)
//       let current = 0
//       response.on('data', chunk => progress((current += chunk.length) / total))
//       // response.on('end', () => progress(1))
//     })
//     .on('error', (error, body, response) => {
//       console.log(error, body, response)
//       reject(error)
//     })
//     .pipe(zlib.Gunzip())
//     .pipe(to)
//     .on('error', reject)
//     .on('close', () => resolve(11))
// })
// promise.progress = p => {
//   progress = p
//   return promise
// }
// return promise

// const cacheDir = path.resolve(__dirname, '../../cache/')
// const fetchFile = (uri, filename, progress) => new Promise((resolve, reject) => {
//   download({ extract: true, mode: '755' })
//     .get(uri)
//     // 输出到下载缓存目录
//     .dest(cacheDir)
//     // 监视下载进度
//     .use((res, uri, next) => {
//       if (!res.headers['content-length']) {
//         next()
//         return
//       }
//       const total = parseInt(res.headers['content-length'], 10)
//       let current = 0
//       res.on('data', chunk => progress && progress((current += chunk.length) / total))
//       res.on('end', () => next())
//     })
//     // .rename(`../${filename}.asar`)
//     .run((error, files) => {
//       if (error) {
//         // console.log(`Got file error: ${error.message}`)
//         reject(error)
//       } else {
//         // 如果更新的是更新器，不能直接运行
//         if (filename === 'updater') {
//           return resolve('updater_updated')
//         }

//         const to = path.resolve(cacheDir, `../${filename}.asar`)

//         fs.rename(files[0].path, to, error => {
//           if (error) {
//             return reject(error)
//           }
//           resolve(filename)
//         })
//       }
//     })
// })

// const getFileStampAsync = (filename, type) => new Promise((resolve, reject) => {
//   type = type || 'sha1'
//   fs.readFile(filename, (error, buffer) => {
//     if (error) return reject(error)
//     const hash = crypto.createHash(type)
//     hash.update(buffer)
//     resolve(hash.digest('hex'))
//   })
// })

const getFileStamp = (filename, type) => {
  type = type || 'sha1'
  try {
    const buffer = fs.readFileSync(filename)
    var hash = crypto.createHash(type)
    hash.update(buffer)
    return hash.digest('hex')
  } catch (e) {
    return ''
  }
}

module.exports = { fetchUrl, fetchJson, fetchFile, getFileStamp }
