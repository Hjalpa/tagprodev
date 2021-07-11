const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let user = req.params.userId
		let userid = await playerExists(user)

		let data = {
			title: `${user}'s allies`,
			user,
			navtab: 'allies',
			nav: 'player',
			show: {
				filters: true
			},
			maps: await req.maps,
			results: await getData(userid, req.query)
		}
		res.render('player', data);
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function getData(player, filters) {

	// defaults
	if(!filters.games) filters.games = '10'
	if(!filters.elo) filters.elo = '0-3000'

	let f = util.getFilters(filters)
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				(count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) * 100 DESC
			) rank,

			name as player,
			count(*) as games,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,
			ROUND(
				(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			, 3) as cap_diff_per_min,
			count(*) filter (WHERE result_half_win = 1) as won,
			count(*) filter (WHERE result_half_win = 0) as lost,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) || '%' as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid

		${f.where}
			AND playerid != '${player}' AND

			gameid IN (
					SELECT
						gameid
					FROM
						playergame as pg
					INNER JOIN player ON player.id = pg.playerid
					WHERE playerid = '${player}' AND gameid = playergame.gameid AND pg.team = playergame.team
				)

		GROUP BY name
		${f.having}
		order by winrate DESC
	`, f.clause, 'all')

	return raw
}

async function playerExists(player) {
	let id = await db.select(`SELECT id from player WHERE name = $1`, [player], 'id')

	if(!id)
		throw 'cannot find player name: ' + player

	return id
}
