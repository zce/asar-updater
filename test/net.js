const net = require('net')
const url = require('url')

function isOnline (callback) {
  const socket = net.connect(53, '199.7.83.42', () => {
    callback(null, true)
    socket.destroy()
  })
  .on('error', err => {
    callback(err, false)
    socket.destroy()
  })
  .setTimeout(1000, () => {
    callback(null, false)
    socket.destroy()
  })
}

console.time('online')
isOnline((err, online) => {
  console.timeEnd('online')
  console.log(err, online)
})

var isOnline = require('is-online');
console.time('online2')
isOnline(function (err, online) {
  console.timeEnd('online2');
  console.log(err, online)
});
