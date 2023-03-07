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
			sum(pup_tp_team_for + pup_rb_team_for + pup_jj_team_for - pup_jj_team_against - pup_tp_team_against - pup_rb_team_against) as "Pup Diff",

			(
				SELECT count(*) as seasons
				FROM seasonplayer as sp
				WHERE playerid = player.id AND seasonteamid = (
						SELECT seasonteamid
						FROM seasonplayer
						WHERE playerid = $1 AND sp.seasonteamid = seasonteamid
						LIMIT 1
					)
				LIMIT 1
			) as seasons,
			(
				SELECT count(*) as playoffwinner
				FROM seasonplayer as sp
				LEFT JOIN seasonteam ON seasonteam.id = sp.seasonteamid
				WHERE playerid = player.id AND seasonteamid = (
						SELECT seasonteamid
						FROM seasonplayer
						WHERE playerid = $1 AND sp.seasonteamid = seasonteamid
						LIMIT 1
					) AND winner = true
				LIMIT 1
			) as playoffwinner,
			(
				SELECT count(*) as leaguewinner
				FROM seasonplayer as sp
				LEFT JOIN seasonteam ON seasonteam.id = sp.seasonteamid
				WHERE playerid = player.id AND seasonteamid = (
						SELECT seasonteamid
						FROM seasonplayer
						WHERE playerid = $1 AND sp.seasonteamid = seasonteamid
						LIMIT 1
					) AND leaguewinner = true
				LIMIT 1
			) as leaguewinner

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
					WHERE playerid = $1 AND gameid = playergame.gameid AND pg.team = playergame.team
				)

		GROUP BY name, player.id, country
		ORDER BY games DESC
	`, [playerid], 'all')

	return raw

}
