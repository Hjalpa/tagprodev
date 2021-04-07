const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Tags',
		maps: req.maps,
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
						(sum(play_time) / sum(tag)) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,

			SUM(tag) as tags,
			round( (sum(tag)::FLOAT / count(*))::numeric , 2) as per_game,
			TO_CHAR(
				(sum(play_time) / sum(tag)) * interval '1 sec'
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
