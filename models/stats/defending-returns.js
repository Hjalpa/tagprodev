const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Defending - Returns',
			nav: 'defending',
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
						(sum(play_time) / sum(cap_team_against)) * interval '1 sec'
					, 'MI:SS') DESC
			) rank,

			player.name as player,

			ROUND((sum(return_within_my_half)::numeric / sum(return)::numeric) * 100, 2) || '%' as returns_within_my_half,
			ROUND((sum(return)::numeric / sum(return_team_for)::numeric) * 100, 2) || '%' as share_of_team_returns,
			ROUND((sum(quick_return)::numeric / sum(quick_return_team_for)::numeric) * 100, 2) || '%' as share_of_team_quick_returns,
			ROUND((sum(key_return)::numeric / sum(key_return_team_for)::numeric) * 100, 2) || '%' as share_of_team_key_returns,
			ROUND((sum(prevent)::numeric / sum(prevent_team_for)::numeric) * 100, 2) || '%' as share_of_team_prevent,

			TO_CHAR(
				(sum(play_time) / sum(return)) * interval '1 sec'
			, 'MI:SS') as return_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY return_every DESC
		LIMIT 100
	`
	return await db.select(sql, [], 'all')
}
