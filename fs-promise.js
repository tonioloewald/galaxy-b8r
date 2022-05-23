const fs = require('fs')

const read = path => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data))
})

const write = (path, text) => new Promise((resolve, reject) => {
  fs.writeFile(path, text, (err, data) => err ? reject(err) : resolve(data))
})

const remove = path => new Promise((resolve, reject) => {
  fs.unlink(path, err => err ? reject(err) : resolve())
})

module.exports = { read, write, remove }
