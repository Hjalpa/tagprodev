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
					(count(*) filter (WHERE result_half_lose = 1) * 3)
					+
					(count(*) filter (WHERE result_half_win = 0 AND result_half_lose = 0))
				)::DECIMAL / count(*)
			, 2) as ppg,
			sum(cap_team_against - cap_team_for) as "Cap Diff",
			sum(pup_tp_team_against + pup_rb_team_against + pup_jj_team_against) - sum(pup_jj_team_for + pup_tp_team_for + pup_rb_team_for) as "Pup Diff",
			COALESCE(
				(
					SELECT count(*)
					FROM seasonplayer as sp
					LEFT JOIN seasonteam as st ON st.id = sp.seasonteamid
					WHERE
						sp.playerid = player.id
						AND sp.seasonteamid NOT IN (
							SELECT seasonteamid
							FROM seasonplayer
							WHERE playerid = $1 AND seasonplayer.seasonteamid = sp.seasonteamid
						)
						AND st.seasonid IN (
							SELECT seasonid
							FROM seasonplayer
							LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
							WHERE playerid = $1 AND seasonteam.seasonid = st.seasonid
						)
					GROUP BY sp.playerid
				)
			, 0) as seasons,
			COALESCE(
				(
					SELECT count(*) as playoffwinner
					FROM seasonplayer as sp
					LEFT JOIN seasonteam as st ON st.id = sp.seasonteamid
					WHERE
						sp.playerid = player.id
						AND sp.seasonteamid NOT IN (
							SELECT seasonteamid
							FROM seasonplayer
							WHERE playerid = $1 AND seasonplayer.seasonteamid = sp.seasonteamid
						)
						AND st.seasonid IN (
							SELECT seasonid
							FROM seasonplayer
							LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
							WHERE playerid = $1 AND seasonteam.seasonid = st.seasonid
						) AND winner = true
					GROUP BY sp.playerid
				)
			, 0) as playoffwinner,
			COALESCE(
				(
					SELECT count(*) as leaguewinner
					FROM seasonplayer as sp
					LEFT JOIN seasonteam as st ON st.id = sp.seasonteamid
					WHERE
						sp.playerid = player.id
						AND sp.seasonteamid NOT IN (
							SELECT seasonteamid
							FROM seasonplayer
							WHERE playerid = $1 AND seasonplayer.seasonteamid = sp.seasonteamid
						)
						AND st.seasonid IN (
							SELECT seasonid
							FROM seasonplayer
							LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
							WHERE playerid = $1 AND seasonteam.seasonid = st.seasonid
						) AND leaguewinner = true
					GROUP BY sp.playerid
				)
			, 0) as leaguewinner

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

		GROUP BY name, player.id, country
		ORDER BY games DESC
	`, [playerid], 'all')

	return raw
}
