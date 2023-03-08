const { Client } = require('pg')

const client = new Client({
	connectionString: process.env.DB,
	ssl: process.env.ENV === 'production' ? { rejectUnauthorized: false } : false
})

client.connect()

const db = {

	query: function(sql, grab) {
		let raw = client
			.query(sql)
			.then(function(rtn) {
				if(grab === 'row')
					return rtn.rows[0]
				else if(grab === 'all')
					return rtn.rows
				else
					return rtn.rows[0][grab]

			})
			.catch(e => {db.error = e})

		return raw
	},

	select: function(sql, data=[], grab) {
		let raw = client
			.query(sql, data)
			.then(function(rtn) {
				if(grab === 'row')
					return rtn.rows[0]
				else if(grab === 'all')
					return rtn.rows
				else
					return rtn.rows[0][grab]

			})
			.catch(e => {db.error = e})

		return raw
	},

	delete: function(table, data=[]) {
		if(table == null || data == null)
			throw 'bad params'

		let query = {
			'clause': [],
			'data': [],
		}
		let num = 1

		for (var key in data) {
			query.clause.push(key + ' = $'+num)
			query.data.push(data[key])
			num++
		}

		let sql = `DELETE FROM ${table} WHERE ${query.clause.join(' AND ')}`
		return client.query(sql, query.data)
			.then(function(rtn) {
				return rtn.rowCount === 0 ? false : true
			})
			.catch(e => {db.error = e})
	},

	insert: function(table, data=[]) {
		if(table == null || data == null)
			throw 'bad params'

		let query = {
			'columns': Object.keys(data),
			'data': [],
			'clause': [],
		}

		let num = 1
		for (var key in data) {
			query.clause.push('$'+num)
			query.data.push(data[key])
			num++
		}

		let sql = `INSERT INTO ${table} (${query.columns.join(',')}) VALUES (${query.clause.join(',')}) RETURNING LASTVAL()`
		return client.query(sql, query.data)
			.then(function(rtn) {
				return rtn.rows[0].lastval
			})
			.catch(e => {db.error = e})

	},

	update: function(table, data=[], condition=[]) {
		if(table == null || data == null)
			throw 'bad params'

		let query = {
			'data': [],
			'set': [],
			'condition': [],
		}

		let num = 1
		for (var key in data) {
			query.set.push(key + ' = $'+num)
			query.data.push(data[key])
			num++
		}
		for (var key in condition) {
			query.condition.push(key + ' = $'+num)
			query.data.push(condition[key])
			num++
		}

		let sql = `UPDATE ${table} SET ${query.set.join(',')} WHERE ${query.condition.join(' AND ')}`
		return client.query(sql, query.data)
			.then(function(rtn) {
				return rtn.rowCount === 0 ? false : true
			})
			.catch(e => {db.error = e})

	},

	insertUpdate: function(table, data=[], conflict=[]) {
		if(table == null || data == null)
			throw 'bad params'

		let query = {
			'columns': Object.keys(data),
			'data': [],
			'clause': [],
			'conflict': [],
		}

		let num = 1
		for (var key in data) {
			query.clause.push('$'+num)
			query.data.push(data[key])
			num++
			query.conflict.push(key + ' = $' +num)
			query.data.push(data[key])
			num++
		}

		let sql = `
			INSERT INTO ${table} (${query.columns.join(',')}) VALUES (${query.clause.join(',')})
			ON CONFLICT (${conflict.join(',')}) DO UPDATE SET ${query.conflict.join(',')}
		`

		return client.query(sql, query.data)
			.then(function(rtn) {
				return rtn
			})
			.catch(e => {db.error = e})

	},

	close: function() {
		client.end()
	}

}

module.exports = db
