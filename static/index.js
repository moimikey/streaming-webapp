const MuxDemux = require('mux-demux')
const Model = require('scuttlebutt/model')
const emitStream = require('emit-stream')
const shoe = require('shoe')
const md = new MuxDemux
const model = new Model

model.on('update', function (key, value) {
  console.log('key', value)
})

md.on('connection', function (c) {
  console.log('connection!')
  switch(c.meta) {
    case 'state':
      return (function _state() {
        c.pipe(model.createStream()).pipe(c)
      }())
    case 'events':
      return (function _events() {
        const em = emitStream(c)
        em.on('join', function (addr) {
          document.querySelector('#log').textContent += 'join ' + JSON.stringify(addr) + '\n'
        })
        em.on('part', function (addr) {
          document.querySelector('#log').textContent += 'part ' + JSON.stringify(addr) + '\n'
        })
      }())
    default:
  }
})

md.pipe(shoe('/_ws')).pipe(md)
