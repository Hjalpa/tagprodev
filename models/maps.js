const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Map Statistics',
			nav: 'maps',
			maps: await req.maps,
			results: await getData(req.query)
		}
		res.render('maps', data);
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
				ROUND( ( sum(redcaps) + sum(bluecaps) ) / count(*)::decimal, 2) desc
			) rank,

			map.name as map,
			count(*) as games,

		--	Round(avg(elo)::decimal, 2) as elo_avg,
		--	TO_CHAR(avg(duration) * interval '1 sec', 'MI:SS') as avg_game_length,

		--	SUM(CASE WHEN redcaps > bluecaps THEN 1 END) as red_won,
		--	SUM(CASE WHEN redcaps < bluecaps THEN 1 END) as blue_won,

			ROUND(
				(
				SUM(CASE WHEN redcaps > bluecaps THEN 1 END) / count(*)::DECIMAL
				) * 100
			, 2) || '%' as red_won,

			ROUND(
				(
				SUM(CASE WHEN redcaps < bluecaps THEN 1 END) / count(*)::DECIMAL
				) * 100
			, 2) || '%' as blue_won,

			sum(redcaps) + sum(bluecaps) as caps,

			ROUND(avg(redcaps), 2) as red_cap_avg,
			ROUND(avg(bluecaps), 2) as blue_cap_avg,

			ROUND( ( sum(redcaps) + sum(bluecaps) ) / count(*)::decimal, 2) as cap_avg



		FROM game
		LEFT JOIN map ON map.id = game.mapid
		-- WHERE seasonid = 1
		GROUP BY map.name
		ORDER BY cap_avg DESC
	`
	return await db.select(sql, [], 'all')
}
