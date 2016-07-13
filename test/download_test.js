// const fs = require('fs')
const download = require('download')

// download('http://git.oschina.net/micua/files/raw/master/tms/dist/core-4.0.0-alpha1.zip', '../temp', { extract: true })
//   .then(data => { console.log(data) })
//   .catch(error => { console.log(error) })

const target = 'http://git.oschina.net/micua/files/raw/master/tms/dist/core-4.0.0-alpha1.zip'
// const target = 'https://npm.taobao.org/mirrors/node/v6.2.2/node-v6.2.2-win-x64.zip'
download(target, 'temp', { extract: true })
  .on('response', response => {
    if (!response.headers['content-length']) {
      return console.log('meiyou')
    }
    const total = parseInt(response.headers['content-length'], 10)
    let current = 0
    response.on('data', chunk => console.log((current += chunk.length) / total))
    response.on('end', () => console.log('end'))
  })
  // .on('error', (error, body, response) => { })
  .then(file => {
    console.log(file[0])
    console.log('-------------')
  })
