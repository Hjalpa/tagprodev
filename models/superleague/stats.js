const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		title: 'Stats',
		nav: {
			primary: 'superleague',
			secondary: 'stats',
			tertiary: 'totals',
		},
		stats: await getData()
	}

	res.render('superleague-stats', data)

}

async function getData(filters) {
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY sum(cap) + sum(assist) DESC
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
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE game.seasonid = 5
		GROUP BY player.name
		ORDER BY rank ASC
	`
	let data = await db.select(sql, [], 'all')

	return data
}
