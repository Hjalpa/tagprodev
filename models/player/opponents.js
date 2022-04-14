const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: req.player.name + ' opponents',
				player: req.player.name,
				path: req.baseUrl,
				nav: {
					cat: 'players',
					page: 'opponents'
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
			LOWER(player.country) as country,
			name as player,
			count(*) as games,
			Round(
				(
					(count(*) filter (WHERE result_half_win = 1) * 3)
					+
					(count(*) filter (WHERE result_half_win = 0 AND result_half_lose = 0))
				)::DECIMAL / count(*)
			, 2) as ppg,
			sum(cap_team_for - cap_team_against) as "Cap Diff",

			ROUND(avg(pup_tp + pup_rb + pup_jj), 2) as "their pups",
			ROUND(avg(cap), 2) as "their caps",
			ROUND(avg(assist), 2) as "their assist",

			count(*) as seasons,

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

		WHERE
			playerid != $1 AND

			gameid IN (
					SELECT
						gameid
					FROM
						playergame as pg
					INNER JOIN player ON player.id = pg.playerid
					WHERE playerid = $1 AND gameid = playergame.gameid AND pg.team != playergame.team
				)

		GROUP BY name, country
		order by "win rate" DESC
	`, [playerid], 'all')

	return raw

}
