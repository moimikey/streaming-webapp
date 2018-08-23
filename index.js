const duplexify = require('duplexify')
const ecstatic = require('ecstatic')(__dirname + '/static')
const emitStream = require('emit-stream')
const http = require('http')
const intoStream = require('into-stream')
const net = require('net')
const request = require('request')
const shoe = require('shoe')
const spdy = require('spdy')

const EventEmitter = require('events').EventEmitter
const Model = require('scuttlebutt/model')
const MuxDemux = require('mux-demux')

module.exports = function (port) {
  const emitter = new EventEmitter
  const model = new Model
  function createStream () {
    const mdm = new MuxDemux
    const modelStream = model.createStream()
    const eventStream = emitStream(emitter)

    mdm.on('connection', function _connection(co) {
      co.pipe({ state: modelStream, events }[co.meta]).pipe(co)
    })

    mdm.on('close', function _close() {
      model.set('connections', model.get('connections') - 1);
    })

    process.nextTick(function () {
      modelStream.pipe(mdm.createStream('state')).pipe(modelStream)
      eventStream.pipe(mdm.createStream('events')).pipe(eventStream)
      model.set('connections', (model.get('connections') || 0) + 1);
    }) 

    return mdm
  }

  const server = http.createServer(function _server (req, res) {
    if (req.url === '/_replicate') {
      req.pipe(createStream()).pipe(res)
      emitter.emit('join', req.socket.address())
      return req.on('end', function _req() {
        emitter.emit('part', req.socket.address())
      })
    }
    return ecstatic(req, res)
  })
  const socket = shoe(function _socket(stream) {
    stream.pipe(createStream()).pipe(stream)
    emitter.emit('join', stream.address)
    stream.on('end', function _stream() {
      emitter.emit('part', req.socket.address())
    })
  })

  console.log('starting server on port...', process.argv[2])

  server.listen(port || process.argv[2])
  socket.install(server, '/_ws')
}
