const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: req.player.name + ' maps',
				player: req.player.name,
				path: req.baseUrl,
				nav: {
					cat: 'players',
					page: 'maps'
				},
			},
			matches: await getAllies(req.player.id)
		}
		res.render('player-allies', data)
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function getAllies(playerid) {
	let raw = await db.select(`
		SELECT
			map.name as map,
			map.unfortunateid as fortunateid,
			count(*) as games,
			Round(
				(
					(count(*) filter (WHERE result_half_win = 1) * 3)
					+
					(count(*) filter (WHERE result_half_win = 0 AND result_half_lose = 0))
				)::DECIMAL / count(*)
			, 2) as ppg,
			sum(cap_team_for - cap_team_against) as "Cap Diff",
			sum(pup_jj_team_for + pup_tp_team_for + pup_rb_team_for) - sum(pup_tp_team_against + pup_rb_team_against + pup_jj_team_against) as "Pup Diff",
			sum(cap) as "My Caps",
			sum(pup_tp + pup_rb + pup_jj) as "My Pups",
			sum(assist) as "My Assists"

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid
		LEFT JOIN map on map.id = game.mapid

		WHERE
			player.id = $1
		GROUP BY map.name, map.unfortunateid
		ORDER BY games DESC
	`, [playerid], 'all')

	return raw

}
