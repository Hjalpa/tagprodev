const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Mercies',
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
				ORDER BY count(*) filter (WHERE cap_team_against = 0)  DESC
			) rank,

			player.name as player,

			count(*) filter (WHERE cap_team_against = 0 AND (cap_team_for - cap_team_against = 5)) as mercy,
			count(*) filter (WHERE cap_team_for = 0) as cleansheet_against,
			count(*) filter (WHERE cap_team_against = 0) as cleansheet,
			count(*) / greatest(count(*) filter (WHERE cap_team_against = 0), 1) as game_per_cleansheet
		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY mercy DESC
		LIMIT 10
	`
	return await db.select(sql, [], 'all')
}
