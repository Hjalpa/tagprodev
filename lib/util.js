const util = {

	getDaysArray: (s, e) => {
		for(var a=[],d=new Date(s);d<=e;d.setDate(d.getDate()+1)){ a.push(util.formatDate(new Date(d)));}return a;
	},

	formatDate: (date) => {
		var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2)
			month = '0' + month
		if (day.length < 2)
			day = '0' + day

		return [year, month, day].join('-')
	},

	getFilters: (filters) => {
		let raw_where = []
		let raw_having = []

		if(filters['season'])
			raw_where.push('seasonid = ' + filters['season'])

		if(filters['map'])
			raw_where.push('mapid = ' + filters['map'])

		if(filters['elo'])
			raw_where.push('elo >= ' + filters['elo'])

		// default if none exist
		if(raw_where.length === 0)
			raw_where.push('elo >= 2000')

		let where = 'WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND ' + raw_where.join(' AND ') + ')'


		if(filters['games'])
			raw_having.push('COUNT(*) > ' + filters['games'])

		// default if none exist
		if(raw_having.length === 0)
			raw_having.push('COUNT(*) > 50')

		let having = 'HAVING ' + raw_having.join(' AND ')

		return {
			where, having
		}
	},

}

module.exports = util
