const db = require ('../lib/db')
const util = require ('../lib/util')
const mvb = require ('../lib/mvb')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: 'Players',
				name:  'Player',
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: 'players',
					page: 'overview'
				}
			},
			players: await getPlayers(),
		}
		res.render('players', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getPlayers() {
	let raw = await db.select(`
		SELECT
			LOWER(player.country) as country,
			player.name as player,
			(
				SELECT
					count(*)::DECIMAL as games
				FROM playergame
				WHERE playerid = player.id
				GROUP BY playerid
				LIMIT 1
			) as games,
			(
				SELECT
					Round(
						(
							(count(*) filter (WHERE result_half_win = 1) * 3)
							+
							(count(*) filter (WHERE result_half_win = 0 AND result_half_lose = 0))
						)::DECIMAL / count(*)
					, 2)
				FROM playergame
				WHERE playerid = player.id
				GROUP BY playerid
				LIMIT 1
			) as ppg,
			(
				SELECT
					sum(cap_team_for - cap_team_against) as cd
				FROM playergame
				WHERE playerid = player.id
				GROUP BY playerid
				LIMIT 1
			) as "cap diff",
			Round(playerskill.rank::DECIMAL, 2) as OpenSkill,
			count(*) as seasons,
			count(*) filter (where seasonteam.winner) as championships,
			count(*) filter (where seasonteam.runnerup) as runnerups,
			Round(COALESCE(avg(cost) filter (where captain = false), 0), 2) as "avg cost",
			count(*) filter (where captain = true) as captaincies,
			(
				SELECT
					ROUND(
						(
							count(*) filter (WHERE result_half_win = 1)
							/
							count(*)::DECIMAL
						)
						* 100
					, 0)
				FROM playergame
				WHERE playerid = player.id
				GROUP BY playerid
				LIMIT 1
			) as "win rate"

		FROM seasonplayer
		LEFT JOIN player ON player.id = seasonplayer.playerid
		LEFT JOIN seasonteam ON seasonplayer.seasonteamid = seasonteam.id
		LEFT JOIN playerskill ON playerskill.playerid = player.id
		GROUP BY player.name, player.country, player.id, games, rank
		HAVING (
			SELECT
				count(*)::DECIMAL as games
			FROM playergame
			WHERE playerid = player.id
			GROUP BY playerid
			LIMIT 1
		) > 0
		ORDER BY ppg DESC, championships DESC, "win rate" DESC, games DESC, "avg cost" DESC
	`, [], 'all')
	return raw
}
