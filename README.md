# asar-updater

[![Build Status](https://travis-ci.org/zce/asar-updater.svg?branch=master)](https://travis-ci.org/zce/asar-updater)
[![Dependency Status](https://david-dm.org/zce/asar-updater.svg)](https://david-dm.org/zce/asar-updater)
[![devDependency Status](https://david-dm.org/zce/asar-updater/dev-status.svg)](https://david-dm.org/zce/asar-updater#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

An auto updater for electron asar

[![NPM](https://nodei.co/npm/asar-updater.png)](https://nodei.co/npm/asar-updater/)
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Is still not fully completed

## Usage

```javascript
updater.init('demo')
updater.on('available', (task) => console.log('available', task))
updater.on('not-available', (task) => console.log('not-available', task))
updater.on('progress', (task, p) => console.log(task.name, p))
updater.on('downloaded', (task) => console.log('downloaded', task))
updater.on('completed', (manifest, tasks) => console.log('completed', manifest))
updater.on('error', console.log)
updater.setFeedURL('data.asar', 'http://localhost:8080/latest/data.json')
updater.setFeedURL('core.asar', 'http://localhost:8080/latest/core.json')
updater.setFeedURL('updater.asar', 'http://localhost:8080/latest/updater.json')
updater.checkForUpdates()
```
