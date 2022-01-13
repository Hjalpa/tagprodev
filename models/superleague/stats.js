const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		title: 'Stats',
		nav: {
			primary: 'superleague',
			secondary: 'stats',
			tertiary: 'summary',
		},
		stats: await getData()
	}

	res.render('superleague-stats', data)

}

async function getData(filters) {
	let sql = `
		SELECT
			COALESCE(team.acronym, 'SUB') as acronym,
			COALESCE(team.color, '#404040') as color,
			player.name as player,

			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,

			SUM(cap)+SUM(assist) as points,
			SUM(cap) as caps,
			SUM(assist) as assists,

			SUM(tag) as tags,
			SUM(pop) as pops,
			SUM(grab) as grabs,
			SUM(drop) as drops,
			TO_CHAR( sum(hold) * interval '1 sec', 'hh24:mi:ss') as hold,
			TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss') as prevent,
			SUM(return) as returns


		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
		LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
		LEFT JOIN team ON seasonteam.teamid = team.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE game.seasonid = 5
		GROUP BY player.name, team.color, team.acronym
		ORDER BY team.acronym ASC
	`
	let data = await db.select(sql, [], 'all')

	return data
}
