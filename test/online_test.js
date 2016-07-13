const online = require('../lib/online')

online()
  .then(res => console.log(res))
  .catch(e => console.log(e))
