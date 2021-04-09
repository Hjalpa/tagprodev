const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Prevent',
			tab: 'Defending',
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
				ORDER BY ROUND(sum(prevent) / (sum(play_time) / 60)::NUMERIC, 2) DESC
			) rank,

			player.name as player,
			TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss') as prevent,
			TO_CHAR( (sum(prevent) / (count(*))) * interval '1 sec', 'mi:ss') as per_game,
			ROUND(sum(prevent) / (sum(play_time) / 60)::NUMERIC, 2) as per_min


		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY per_min DESC
		LIMIT 100
	`
	return await db.select(sql, f.clause, 'all')
}
