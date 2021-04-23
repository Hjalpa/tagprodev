const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Defense',
			nav: 'defense',
			maps: await req.maps,
			results: await getData(req.query)
		}
		res.render('stats', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getData(filters) {
	let f = util.getFilters(filters)
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / sum(cap_from_my_prevent)) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,

			TO_CHAR(
				(sum(play_time) / sum(cap_team_against)) * interval '1 sec'
			, 'MI:SS') as concede_every,

			-- convert to percentage
			-- (100 - ROUND((sum(hold_team_against)::numeric / sum(play_time)::numeric) * 100, 2)) || '%' as flag_in_base,

			-- ROUND((sum(return_within_my_half)::numeric / sum(return)::numeric) * 100, 2) || '%' as returns_within_my_half,

			TO_CHAR(
				avg(hold_team_against) * interval '1 sec'
			, 'MI:SS') as hold_against,

			TO_CHAR(
				(sum(play_time) / sum(return)) * interval '1 sec'
			, 'MI:SS') as return_every,

			-- greatest fixes "division by zero" error
			TO_CHAR(
				(sum(play_time) / greatest(sum(key_return), 1)) * interval '1 sec'
			, 'MI:SS') as key_return_every,

			TO_CHAR(
				(sum(play_time) / sum(quick_return)) * interval '1 sec'
			, 'MI:SS') as quick_return_every,

			ROUND(sum(prevent) / sum(return)::numeric, 2) as prevent_per_return,

			TO_CHAR(
				(sum(play_time) / sum(cap_from_my_prevent)) * interval '1 sec'
			, 'MI:SS') as cap_from_my_prevent_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY cap_from_my_prevent_every ASC
		LIMIT 100
	`
	return await db.select(sql, f.clause, 'all')
}
