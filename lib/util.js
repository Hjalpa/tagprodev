const db = require('../lib/db')

const util = {

	getFilters: (filters) => {
		let raw_where = []
		let raw_having = []

		if(filters['map']) {
			let maps = filters['map'].split(',')
			let raw = []
			for (const s of maps) {
				if(util.isNumber(s))
					raw.push(s)
				else
					throw 'invalid map id: ' + s
			}
			// remove duplicates
			let ids = [...new Set(raw)]
			raw_where.push(`mapid in (${ids.join(',')})`)
		}

		if(filters['season']) {
			let seasons = filters['season'].split(',')
			let raw = []
			// remember that s2 ctf is season id 1
			for (const s of seasons) {
				if(s === '1')
					raw.push('2')
				else if(s === '2')
					raw.push('1')
				else
					throw 'cannot find season: ' + s
			}
			// remove duplicates
			let ids = [...new Set(raw)]
			raw_where.push(`seasonid in (${ids.join(',')})`)
		}

		if(filters['elo']) {
			let elo = filters['elo'].split('-')

			if(!util.isNumber(elo[0]) || !util.isNumber(elo[1]))
				throw 'invalid number: ' + elo

			let min = parseInt(elo[0])
			let max = parseInt(elo[1])

			if(min > max)
				throw 'min elo cannot be higher than max elo'

			if(min < 0 || min > 3000 || max < 0 || max > 3000)
				throw 'elo out of range'

			raw_where.push(`elo >= ${min} AND elo <= ${max}`)
		}

		// default if none exist
		if(raw_where.length === 0)
			raw_where.push('elo >= 2100')

		let where = 'WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND ' + raw_where.join(' AND ') + ')'


		if(filters['games'])
			raw_having.push('COUNT(*) > ' + filters['games'])

		// default if none exist
		if(raw_having.length === 0)
			raw_having.push('COUNT(*) >= 30')
			// raw_having.push('COUNT(*) >= 47')

		let having = 'HAVING ' + raw_having.join(' AND ')

		return {
			where, having
		}
	},

	isNumber: (str) => {
		if (typeof str != "string") return false // we only process strings!
		// could also coerce to string: str = ""+str
		return !isNaN(str) && !isNaN(parseFloat(str))
	}

}

module.exports = util
