// const got = require('got')
const utils = require('../lib/utils')

utils.fetchFile('http://git.oschina.net/micua/tms/raw/v4.x/packages/core-4.1.0-beta1.zip', 'core')
  .progress(p => console.log(`current progress is ${p}`))
  .then(res => {
    console.log(res)
  })
  .catch(error => console.log(error))
