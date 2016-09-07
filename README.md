# asar-updater

[![Build Status](https://travis-ci.org/zce/asar-updater.svg?branch=master)](https://travis-ci.org/zce/asar-updater)
[![Dependency Status](https://david-dm.org/zce/asar-updater.svg)](https://david-dm.org/zce/asar-updater)
[![devDependency Status](https://david-dm.org/zce/asar-updater/dev-status.svg)](https://david-dm.org/zce/asar-updater#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

An auto updater for electron asar

[![NPM](https://nodei.co/npm/asar-updater.png)](https://nodei.co/npm/asar-updater/)
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)



## Usage

```javascript
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

```

[Example](https://github.com/zce/electron-boilerplate)
