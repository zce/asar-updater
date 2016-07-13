const updater = require('../lib/updater')

updater.init('demo')

updater._fetchJson('https://raw.githubusercontent.com/soundblogs/soundplayer-electron/master/package.json')
  .then(console.log)
  .catch(console.log)
