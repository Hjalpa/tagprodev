const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Rolling Twenty Five',
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
			select playergame.id, playerid,result_half_win,cap,hold,prevent,row_number()over(partition by playerid order by playergame.id desc) rn from playergame
		)

		SELECT
			RANK() OVER (
				ORDER BY
					count(*) filter (WHERE result_half_win = 1) DESC
			) rank,
			player.name AS player,
			count(*) filter (WHERE result_half_win = 1) AS won,

			-- sum(cap) AS caps,
			-- sum(hold) AS hold,
			-- sum(prevent) AS prevent,

			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) || '%' as win_rate

		FROM player
		LEFT JOIN recentgames ON playerid = player.id
		WHERE rn <= 25
		GROUP BY player.name
		ORDER BY won DESC
		LIMIT 75
	`, 'all')

	return raw
}
