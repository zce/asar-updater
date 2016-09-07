const path = require('path')
const { app } = require('electron')
const updater = require('../')

app.on('ready', () => {
  updater.init()
  updater.on('available', (task) => {
    console.log('available', task)
  })
  updater.on('not-available', (task) => {
    console.log('not-available', task)
  })
  updater.on('progress', (task, p) => {
    console.log(task.name, p)
  })
  updater.on('downloaded', (task) => {
    console.log('downloaded', task)
  })
  updater.on('completed', (manifest, tasks) => {
    console.log('completed', manifest, tasks)
    app.quit()
  })
  updater.on('error', (err) => {
    console.error(err)
    app.quit()
  })
  updater.setFeedURL(path.join(__dirname, 'core.asar'), 'http://git.oschina.net/wedn/ebp/raw/vue/latest/core.json')
  updater.setFeedURL(path.join(__dirname, 'data.asar'), 'http://git.oschina.net/wedn/ebp/raw/vue/latest/data.json')
  updater.checkForUpdates()
})
