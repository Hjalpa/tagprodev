const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let user = req.params.userId

		await playerExists(user)

		let data = {
			title: `${user}'s opponents`,
			nav: 'player',
			results: await getData(user)
		}
		res.render('player', data);
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function getData(player) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				(count(*) filter (WHERE result_half_win = 0) / count(*)::DECIMAL) * 100 DESC
			) rank,

			name as player,
			count(*) as played,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,

			ROUND(
				(sum(cap_team_against)::DECIMAL - sum(cap_team_for)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			, 3) as cap_diff_per_min,
			-- (sum(cap_team_against) - sum(cap_team_for))::NUMERIC as cap_diff_total,
			count(*) filter (WHERE result_half_win = 0) as won,
			count(*) filter (WHERE result_half_win = 1) as lost,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 0)
					/
					count(*)::DECIMAL
				) * 100
			, 2) || '%' as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		-- LEFT JOIN game on game.id = playergame.gameid

		WHERE
			-- seasonid = 2 AND
			name != $1 AND

			gameid IN (
					SELECT
						gameid
					FROM
						playergame as pg
					INNER JOIN player ON player.id = pg.playerid
					WHERE name = $2 AND gameid = playergame.gameid AND pg.team != playergame.team
				)

		GROUP BY name
		HAVING count(*) > 10
		order by winrate DESC
	`, [player, player], 'all')

	return raw
}

async function playerExists(player) {
	let id = await db.select(`SELECT id from player WHERE name = $1`, [player], 'row')

	if(!id)
		throw 'cannot find player name: ' + player

	return true
}
