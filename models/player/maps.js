const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: req.player.name + ' allies',
				player: req.player.name,
				path: req.baseUrl,
				nav: {
					cat: 'players',
					page: 'allies'
				},
			},
			matches: await getAllies(req.player.id)
		}
		console.log(data)
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
			count(*) as games,
			Round(
				(
					(count(*) filter (WHERE result_half_win = 1) * 3)
					+
					(count(*) filter (WHERE result_half_win = 0 AND result_half_lose = 0))
				)::DECIMAL / count(*)
			, 2) as ppg,
			sum(cap_team_for - cap_team_against) as "Cap Diff",
			sum(cap) as caps,
			sum(pup_tp + pup_rb + pup_jj) as pups,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) as "win rate"

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid
		LEFT JOIN map on map.id = game.mapid

		WHERE
			player.id = $1
		GROUP BY map.name
		ORDER BY "win rate" DESC
	`, [playerid], 'all')

	return raw

}
