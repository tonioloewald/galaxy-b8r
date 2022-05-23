const DATA_ROOT = `${__dirname}/data`

const uuid = require('./uuid')

const { read, write, remove } = require('./fs-promise')

const tables = {}

class JSON_db {
  constructor (name, config = {}, initial_state = {}) {
    if (tables[name]) {
      throw `duplicate table definition ${name}`
    }
    tables[name] = this
    this.name = name
    this.path = `${DATA_ROOT}/${name}.json`
    this.ready = read(this.path)
      .then(text => this.data = JSON.parse(text))
      .catch(() => {
        console.log(`${name} initializing to default state`)
        this.data = initial_state
      })
    this.config = config
  }

  async remove (delete_file = false) {
    await this.ready
    delete tables[this.name]
    if (delete_file) {
      await remove(this.path)
    }
  }

  async get (id) {
    await this.ready
    const { children, computed } = this.config
    const record = Object.assign({ id }, this.data[id])
    const ref_field = `${this.name}_id`
    for (const i in children) {
      const child_table = children[i]
      if (tables[child_table]) {
        record[child_table] = await tables[child_table].findAll(rec => rec[ref_field] === id)
      } else {
        console.error(`cannot resolve relation, child table ${child_table} does not exist`)
      }
    }

    Object.keys(computed || {}).forEach(field => {
      record[field] = computed[field](record)
    })
    return record
  }

  async create (record) {
    await this.ready
    const id = uuid()
    this.data[id] = record
    await write(this.path, JSON.stringify(this.data, false, 2))
    return id
  }

  async set (id, record) {
    if (this.data[id]) {
      this.data[id] = record
      await write(this.path, JSON.stringify(this.data, false, 2))
    } else {
      console.error(`cannot update record id ${id}, it does not exist; use create instead`)
    }
  }

  async delete (id) {
    await this.ready
    if (this.data[id]) {
      delete this.data[id]
      await write(this.path, JSON.stringify(this.data, false, 2))
    }
  }

  async findOne (test) {
    await this.ready
    const keys = Object.keys(this.data)
    for (const i in keys) {
      const key = keys[i]
      if (test(this.data[key])) return this.get(key)
    }
  }

  async findAll (test) {
    await this.ready
    const found = []
    const keys = Object.keys(this.data)
    for (const i in keys) {
      const key = keys[i]
      if (test(this.data[key])) found.push(await this.get(key))
    }
    return found
  }

  async all () {
    await this.ready
    const ids = Object.keys(this.data)
    const records = []
    for (const i in ids) {
      const id = ids[i]
      records.push(await this.get(id))
    }
    return records
  }
}

/*
// quick tests
(async () => {
  const test = new JSON_db('test', {children: ['test_kids']}, {
    17: {
      foo: 'bar',
    }
  });

  const test_kids = new JSON_db('test_kids', {}, {
    101: {
      test_id: 17,
      baz: 'lurman'
    }
  });

  console.log('json_db tests');
  console.log('get by id works', (await test.get(17)).foo === 'bar');
  console.log('find children works', (await test.get(17)).test_kids.length === 1);
  const new_kid_id = await test_kids.create({test_id: 17, baz: 'fawlty'});
  console.log('adding a record works', (await test.get(17)).test_kids.length === 2);
  await test_kids.delete(new_kid_id);
  console.log('deleting a record works', (await test.get(17)).test_kids.length === 1);
  const new_test_id = await test.create({foo: 'shizzle'});
  console.log('new record ids work', (await test.get(new_test_id)).foo === 'shizzle');
  console.log('findOne works', (await test.findOne(rec => rec.foo === 'shizzle')).id === new_test_id);
  console.log('findAll works', (await test.findAll(rec => rec.foo === 'shizzle'))[0].id === new_test_id);
  await test.set(new_test_id, {foo: 'shazbat'});
  console.log('updating a record works', (await test.get(new_test_id)).foo === 'shazbat');

  // cleanup test files
  await test.remove(true);
  await test_kids.remove(true);
})();
*/

module.exports = JSON_db
