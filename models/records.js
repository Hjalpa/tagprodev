const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		tab: 'records',
		winratio: await longestGame(),
	}
	res.render('records', data);
}

async function longestGame() {
	let raw = await db.select(`
		SELECT
			-- player.name as player,
			max(play_time) as play_time

		FROM playergame
		-- LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		-- GROUP BY player.name
		-- HAVING COUNT(*) > 50
		-- ORDER BY win_ratio DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

/*
 longest win
 quickest win

 most caps in a game
 most returns in a game
 most hold in a game
 most
 */
