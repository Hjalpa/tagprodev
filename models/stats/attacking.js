const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Attacking',
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

			-- hold per grab
			-- hold per cap
			-- hold whilst opponents DONT

			-- grab
			-- grab / grab_team_for (percentage of team grabs)
			-- grab vs grab_team_against (percent)
			-- grab whilst opponents prevent
			-- grab whilst opponents prevent (percent of team grabs)

			-- grab / cap
			-- grab / hold

			TO_CHAR(
				(sum(play_time) / sum(grab)) * interval '1 sec'
			, 'MI:SS') as grab_every,

			TO_CHAR(
				(sum(play_time) / greatest(sum(long_hold), 1)) * interval '1 sec'
			, 'MI:SS') as long_hold_every,

			ROUND(sum(hold) / sum(grab)::numeric, 2) as hold_per_grab,

			ROUND(sum(grab) / sum(cap)::numeric, 2) as grabs_per_cap,

			TO_CHAR(
				ROUND(sum(hold) / sum(cap)::numeric, 2)
				* interval '1 sec'
			, 'MI:SS') as hold_per_cap,

			TO_CHAR(
				(sum(play_time) / sum(cap)) * interval '1 sec'
			, 'MI:SS') as cap_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY cap_every ASC
		LIMIT 100
	`
	return await db.select(sql, f.clause, 'all')
}
