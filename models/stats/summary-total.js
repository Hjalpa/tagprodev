const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Summary Totals',
		maps: await req.maps,
		results: await getData(req.query)
	}
	res.render('stats', data);
}

async function getData(filters) {
	let f = util.getFilters(filters)
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY count(*) DESC
			) rank,

			player.name as player,

			SUM(tag) as tags,
			SUM(pop) as pops,
			SUM(grab) as grabs,
			SUM(drop) as drops,
			TO_CHAR( sum(hold) * interval '1 sec', 'hh24:mi:ss') as hold,
			SUM(cap) as caps,
			TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss') as prevent,
			SUM(return) as returns,

			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,
			count(*) as games

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY games DESC
		LIMIT 100
	`
	return await db.select(sql, [], 'all')
}
