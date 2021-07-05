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
			select playergame.id, playerid,result_half_win,cap,cap_team_for,cap_team_against,play_time,row_number()over(partition by playerid order by playergame.id desc) rn from playergame
		)

		SELECT
			RANK() OVER (
				ORDER BY
					count(*) filter (WHERE result_half_win = 1) DESC
			) rank,
			player.name AS player,


			ROUND(
				(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			, 3) as cap_diff_per_min,

			count(*) filter (WHERE result_half_win = 1) AS won

			--ROUND(
			--	(
			--		count(*) filter (WHERE result_half_win = 1)
			--		/
			--		count(*)::DECIMAL
			--	) * 100
			--, 2) || '%' as win_rate


		FROM player
		LEFT JOIN recentgames ON playerid = player.id
		WHERE rn <= 25
		GROUP BY player.name
		ORDER BY won DESC
		LIMIT 100
	`, 'all')

	return raw
}
