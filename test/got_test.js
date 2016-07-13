// const fs = require('fs')
// const got = require('got')

// // const target = 'http://micua.oschina.io/tms/late1st/data.json'
// const target = 'https://npm.taobao.org/mirrors/node/v6.2.2/node-v6.2.2.tar.gz'
// got.stream(target)
//   .pipe(fs.createWriteStream('node.tar'))
//   // .then(response => {
//   //   // console.log(response.body)
//   // })
//   // .catch(error => {
//   //   // console.log(error.response.statusCode)
//   // })

const zlib = require('zlib')
// const gzip = zlib.createGzip()
// const fs = require('fs')
// const inp = fs.createReadStream('core.asar')
// const out = fs.createWriteStream('core.asar.gz')

// inp.pipe(gzip).pipe(out)

const unzip = zlib.createUnzip()
const fs = require('fs')
const inp = fs.createReadStream('core.asar.zip')
const out = fs.createWriteStream('core')
inp.pipe(unzip).pipe(out)
