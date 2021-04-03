const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Caps',
		tab: 'player stats',
		results: await getData(req.query)
	}
	res.render('stats', data);
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

			-- TO_CHAR( sum(prevent_team_for) * interval '1 sec', 'hh:mi:ss') as team_prevent,
			-- TO_CHAR( sum(prevent) * interval '1 sec', 'mi:ss') as prevent,
			-- sum(prevent) / (sum(prevent_team_for) / 60) as team_prevent_per_min,
			-- sum(prevent) / (sum(play_time) / 60) as prevent_per_min

			SUM(cap) as caps,
			round( (sum(cap)::FLOAT / count(*))::numeric , 2) as per_game,
			TO_CHAR(
				(sum(play_time) / sum(cap)) * interval '1 sec'
			, 'MI:SS') as every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY every ASC
		LIMIT 100
	`
	return await db.select(sql, [], 'all')
}
