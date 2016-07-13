const updater = require('../lib/updater')

updater.init('demo')

updater._fetchFile('http://git.oschina.net/micua/tms/raw/master/packages/updater-1.0.0-alpha1.zip', 'demo')
  .progress(p => console.log(`progress : ${p}`))
  .then(console.log)
  .catch(console.log)
