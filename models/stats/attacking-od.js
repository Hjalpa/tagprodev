const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Attacking - OD',
			nav: 'attacking',
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
						(sum(play_time) / sum(cap)) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,

			ROUND((sum(return_within_5_tiles_from_opponents_base)::numeric / sum(return_within_5_tiles_from_opponents_base_team_for)::numeric) * 100, 2) || '%' as share_of_team_returns_within_5_tiles,

			TO_CHAR(
				(sum(play_time) / sum(return_within_5_tiles_from_opponents_base)) * interval '1 sec'
			, 'MI:SS') as return_within_5_tiles_every,

			ROUND((sum(return_within_2_tiles_from_opponents_base)::numeric / sum(return_within_2_tiles_from_opponents_base_team_for)::numeric) * 100, 2) || '%' as share_of_team_returns_within_2_tiles,


			TO_CHAR(
				(sum(play_time) / sum(return_within_2_tiles_from_opponents_base)) * interval '1 sec'
			, 'MI:SS') as return_within_2_tiles_every,

			TO_CHAR(
				(sum(play_time) / sum(grab_whilst_opponents_hold)) * interval '1 sec'
			, 'MI:SS') as grab_whilst_opponents_hold_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY return_within_2_tiles_every ASC
		LIMIT 100
	`
	return await db.select(sql, [], 'all')
}
