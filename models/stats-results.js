const exec = require('child_process').exec
const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.results = async (req, res) => await results(req, res)
let results = async (req, res) => {

	let data = {
		results: await getResults(),
	}

	res.render('stats-results', data);
}

async function getResults() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY count(*) DESC
			) rank,

			player.name as player,
			count(*)as game,

			(SELECT euid FROM game where min(gameid) = game.id limit 1) as last_seen_euid,
			(SELECT euid FROM game where max(gameid) = game.id limit 1) as first_seen_euid,

			TO_CHAR( MIN(play_time) * interval '1 sec', 'MI:SS') as min_game_length,
			TO_CHAR( MAX(play_time) * interval '1 sec', 'MI:SS') as max_game_length,
			TO_CHAR((sum(play_time) / count(*)) * interval '1 sec', 'MI:SS') as average_game_length,

			count(*) filter (WHERE result_half_lose = 1) as lose,
			count(*) filter (WHERE result_half_win = 1) as win,

			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) || '%' as win_ratio

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid

        -- WHERE gameid in (SELECT id FROM game WHERE gameid = game.id and game.elo > 1800)
        -- WHERE gameid in (SELECT id FROM game WHERE gameid = game.id and game.mapid = 4)

		GROUP BY player.name
		-- HAVING COUNT(*) > 10
		ORDER BY game DESC
		LIMIT 100
	`, [], 'all')

	return raw
}
