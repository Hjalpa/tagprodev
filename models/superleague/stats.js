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

			ROUND( sum(play_time) / 60, 0) as mins,

			SUM(cap) as caps,
			SUM(assist) as assists,

			ROUND((
					sum(hold)::DECIMAL / (
						sum(hold_team_for)::DECIMAL + sum(hold_team_against)::DECIMAL
					)
			) * 100, 0) || '%' as poss,

			SUM(tag) as tags,
			SUM(takeover) as takeovers,
			SUM(grab) as grabs,
			TO_CHAR( sum(hold) * interval '1 sec', 'hh24:mi:ss') as hold,
			SUM(chain) as chains,
			TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss') as prevent,
			TO_CHAR( sum(block) * interval '1 sec', 'hh24:mi:ss') as block,
			SUM(pup_jj)+SUM(pup_rb)+SUM(pup_tp) as pups


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
