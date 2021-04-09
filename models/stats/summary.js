const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Summary - Per Minute',
		nav: 'summary',
		maps: await req.maps,
		results: await getData(req.query)
	}
	res.render('stats', data)
}

async function getData(filters) {
	let f = util.getFilters(filters)
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY sum(play_time) DESC
			) rank,

			player.name as player,
			ROUND(sum(tag) / (sum(play_time) / 60)::numeric, 2) as tags,
			ROUND(sum(pop) / (sum(play_time) / 60)::numeric, 2) as pops,
			ROUND(sum(grab) / (sum(play_time) / 60)::numeric, 2) as grabs,
			ROUND(sum(drop) / (sum(play_time) / 60)::numeric, 2) as drops,
			ROUND(sum(hold) / (sum(play_time) / 60)::numeric, 2) as hold,
			ROUND(sum(cap) / (sum(play_time) / 60)::numeric, 2) as caps,
			ROUND(sum(prevent) / (sum(play_time) / 60)::numeric, 2) as prevent,
			ROUND(sum(return) / (sum(play_time) / 60)::numeric, 2) as returns,
			ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) as pups,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY sum(play_time) DESC
		LIMIT 100
	`
	return await db.select(sql, [], 'all')
}
