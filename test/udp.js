'use strict'
const dgram = require('dgram')

function isOnline (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  options.server = options.server || '199.7.83.42'
  options.timeout = options.timeout || 400

  // Craft a DNS query
  const payload = new Buffer([
    0x00, 0x00, /* Transaction ID */
    0x01, 0x00, /* Standard Query */
    0x00, 0x01, /* Questions: 1   */
    0x00, 0x00, /* Answer RRs     */
    0x00, 0x00, /* Authority RRs  */
    0x00, 0x00, /* Additional RRs */
    0x00,       /* Name:  <root>  */
    0x00, 0x02, /* Type:  NS      */
    0x00, 0x01  /* Class: IN      */
  ])

  let udpSocket = dgram.createSocket('udp4')
  let timer = null

  udpSocket.on('message', (msg, remote) => {
    callback(null, msg && msg.length >= 2 && remote.address === options.server)
    timer && clearTimeout(timer)
    udpSocket && udpSocket.close()
    udpSocket = null
  })

  udpSocket.send(payload, 0, payload.length, 53, options.server, () => {
    timer = setTimeout(() => {
      callback(null, false)
      udpSocket && udpSocket.close()
      udpSocket = null
    }, options.timeout)
  })
}

for (let i = 0; i < 100; i++) {
  console.time('online' + i)
  isOnline((err, online) => {
    console.timeEnd('online' + i)
    console.log(err, online)
  })
}

