const updater = require('../lib/updater')

updater.init('demo')

updater.setFeedURL('core.asar', 'http://git.oschina.net/micua/tms/raw/master/packages/core-4.0.0-beta1.zip')
updater.setFeedURL('updater.asar', 'http://git.oschina.net/micua/tms/raw/master/packages/updater-1.0.0-beta1.zip')

updater.checkForUpdates()
