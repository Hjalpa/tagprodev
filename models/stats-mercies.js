const exec = require('child_process').exec
const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Mercies',
		tab: 'player stats',
		results: await getMercies(req.query)
	}
	res.render('stats-test', data);
}

async function getMercies(filters) {
	let f = await getFilters(filters)
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY count(*) filter (WHERE cap_team_against = 0)  DESC
			) rank,

			player.name as player,

			count(*) as games,
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

async function getFilters(filters) {
	let raw_where = []
	let raw_having = []

	if(filters['season'])
		raw_where.push('seasonid = ' + filters['season'])

	if(filters['map'])
		raw_where.push('mapid = ' + filters['map'])

	if(filters['elo'])
		raw_where.push('elo >= ' + filters['elo'])

	if(filters['games'])
		raw_having.push('COUNT(*) > ' + filters['games'])

	let where = 'WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND ' + raw_where.join(' AND ') + ')'
	let having = 'HAVING ' + raw_having.join(' AND ')

	return {
		where, having
	}
}
