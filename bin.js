const meow = require('meow')
const simply = require('./index')

const cli = meow(`
  Usage
  $ simply [command]

  Commands
  Options

  Examples
  $ simply
`, {
  flags: {}
})

switch(cli.input[0]) {
  case undefined:
    return cli.showHelp()
  default:
    simply(cli.input[0])
}
