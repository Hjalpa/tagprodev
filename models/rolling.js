const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Rolling Hundred Fifty',
			nav: 'rolling',
			results: await getData(),
		}
		res.render('rolling', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getData() {
	let raw = await db.query(`
		with recentgames as (
			select playergame.id, playerid,result_half_win,row_number()over(partition by playerid order by playergame.id desc) rn from playergame
			-- select playergame.id, playerid,result_half_win,row_number()over(partition by playerid order by playergame.id desc) rn from playergame left join game on game.id = playergame.gameid where elo > 2000
		)

		SELECT
			RANK() OVER (
				ORDER BY
					count(*) filter (WHERE result_half_win = 1) DESC
			) rank,
			player.name AS player,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) || '%' as win_ratio,
			count(*) filter (WHERE result_half_win = 1) AS wins

		FROM player
		LEFT JOIN recentgames ON playerid = player.id
		WHERE rn <= 150
		GROUP BY player.name
		ORDER BY wins DESC
		LIMIT 50
	`, 'all')

	return raw
}
