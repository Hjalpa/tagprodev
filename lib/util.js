const util = {

	getFilters: (filters) => {
		let num = 1
		let query = {
			where: [],
			having: [],
			clause: [],
		}

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

			let tmp = []
			for (var i in ids) {
				tmp.push('$'+num)
				query.clause.push(ids[i])
				num++
			}
			query.where.push('mapid in (' + tmp.join(',') + ')')
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
				else if(s === '3')
					raw.push('3')
				else
					throw 'cannot find season: ' + s
			}
			// remove duplicates
			let ids = [...new Set(raw)]

			let tmp = []
			for (var i in ids) {
				tmp.push('$'+num)
				query.clause.push(ids[i])
				num++
			}
			query.where.push('seasonid in (' + tmp.join(',') + ')')
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

			query.where.push('elo >= $'+num)
			query.clause.push(min)
			num++

			query.where.push('elo <= $'+num)
			query.clause.push(max)
			num++
		}

		// default if no where filters exist
		if(query.where.length === 0) {
			query.where.push('elo >= $'+num)
			query.clause.push(2000)
			num++
		}

		if(filters['games']) {
			if(!util.isNumber(filters.games) || !util.isNumber(filters.games))
				throw 'invalid game number: ' + filters.games

			query.having.push('COUNT(*) >= $'+num)
			query.clause.push(filters['games'])
			num++
		}

		// default if no having filters exist
		if(query.having.length === 0) {
			query.having.push('COUNT(*) >= $'+num)
			query.clause.push(25)
			num++
		}

		let where = 'WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND ' + query.where.join(' AND ') + ')'
		let having = 'HAVING ' + query.having.join(' AND ')
		let clause = query.clause

		return {
			where, having, clause
		}
	},

	isNumber: (str) => {
		if (typeof str != "string") return false // we only process strings!
		// could also coerce to string: str = ""+str
		return !isNaN(str) && !isNaN(parseFloat(str))
	},

    displayDate: (rawDate, output) => {
        const date = new Date(rawDate)
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const months = ['January', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const nth = (d) => {
            if (d > 3 && d < 21) return 'th';
            switch (d % 10) {
                case 1:  return "st";
                case 2:  return "nd";
                case 3:  return "rd";
                default: return "th";
            }
        }

        if(output === 'weekday')
            return weekDays[date.getDay()]
        else if(output === 'day month')
            return date.getDate() + ' ' + months[date.getMonth()]
        else if(output === 'weekday day month')
            return weekDays[date.getDay()] + ' ' + date.getDate() + nth(date.getDate()) + ' ' + months[date.getMonth()]
    }

}

module.exports = util
