const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		title: 'Recently Logged Games',
		nav: 'log',
		games: await getData(),
	}

	res.render('log', data);
}

async function getData() {
	let raw = await db.select(`
		SELECT
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date,
			ROUND(elo)::integer as elo,
			TO_CHAR(duration * interval '1 sec', 'MI:SS') as duration,
			redcaps as red_caps,
			bluecaps as blue_caps,
			-- grab red team
			array_to_string (
				ARRAY(
					select name from playergame left join player on player.id = playergame.playerid where playergame.gameid = game.id AND playergame.team = 1
				),
			', ') AS red_team,
			-- grab blue team
			array_to_string (
				ARRAY(
					select name from playergame left join player on player.id = playergame.playerid where playergame.gameid = game.id AND playergame.team = 2
				),
			', ') AS blue_team
		FROM game
		LEFT JOIN season ON season.id = game.seasonid
		ORDER BY euid DESC
		LIMIT 75
	`, [], 'all')

	return raw
}
