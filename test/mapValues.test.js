const test = require('ava')

const { collect } = require('./helpers/helper')

test.cb('map values', (t) => {
  const headers = []
  const indexes = []
  const mapValues = ({ header, index, value }) => {
    headers.push(header)
    indexes.push(index)
    return parseInt(value, 10)
  }

  const verify = (err, lines) => {
    t.false(err, 'no err')
    t.snapshot(lines[0], 'first row')
    t.is(lines.length, 1, '1 row')
    t.snapshot(headers, 'headers')
    t.snapshot(indexes, 'indexes')
    t.end()
  }

  collect('basic', { mapValues }, verify)
})

test.cb('map last empty value', (t) => {
  const mapValues = ({ value }) => {
    return value === '' ? null : value
  }

  const verify = (err, lines) => {
    t.false(err, 'no err')
    t.is(lines.length, 2, '2 rows')
    t.is(lines[0].name, null, 'name is mapped')
    t.is(lines[0].location, null, 'last value mapped')
    t.end()
  }

  collect('empty-columns', { mapValues, headers: ['date', 'name', 'location'] }, verify)
})

test.cb('getMapValue - explicit headers', (t) => {
  const emptyToNull = v => v === '' ? null : v
  const getMapValue = ({ header }) => {
    return header !== 'date' ? emptyToNull : undefined
  }

  const verify = (err, lines) => {
    t.false(err, 'no err')
    t.is(lines.length, 2, '2 rows')
    t.is(lines[0].name, null, 'name is mapped')
    t.is(lines[0].location, null, 'last value mapped')
    t.end()
  }

  collect('empty-columns', { getMapValue, headers: ['date', 'name', 'location'] }, verify)
})

test.cb('getMapValue - auto headers', (t) => {
  const getMapValue = ({ header }) => {
    switch (header) {
      case 'num': return Number
      case 'empty': return v => v === '' ? null : v
      // case 'str': /* noop */
    }
  }

  const verify = (err, lines) => {
    t.false(err, 'no err')
    t.is(lines.length, 1, '1 row')
    t.is(lines[0].num, 1, 'num converted to number')
    t.is(lines[0].str, '2', 'str unconverted')
    t.is(lines[0].empty, null, 'empty converted to null')
    t.end()
  }

  collect('get-map-value', { getMapValue }, verify)
})
