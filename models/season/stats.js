const db = require ('../../lib/db')
const util = require ('../../lib/util')
const mvb = require ('../../lib/mvb')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let rounds = await getAllRounds(req.seasonid)
		let r = rounds[req.params.id]
		let filters =  {
			seasonid: req.seasonid,
			date: (req.params.id) ? await getRoundDate(req.params.id, req.seasonid) : false,
			final: (req.params.id === 'final') ? true : false,
			league: false
		}

		if(req.params.id === undefined || (r && r.league))
			filters.league = true

		let data = {
			config: {
				title: req.mode.toUpperCase() + ' Season ' + req.season + ' Stats' + ((req.params.id) ? ' - Round ' + req.params.id : ''),
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: req.mode,
					page: 'stats',
					sub: (req.params.id) ? req.params.id: 'totals',
				}
			},
			rounds,
			stats: await getData(filters, req.mode)
		}
		res.render('superleague-stats', data)
	}
	catch(error) {
		res.status(404).render('404')
	}
}

async function getData(filters, gamemode) {
	let i = 1
	let query = {
		where: ['game.seasonid = $' + i],
		data: [filters.seasonid],
	}

	if(filters.date) {
		i++
		query.where.push('seasonschedule.date = $' + i)
		query.data.push(filters.date)
	}

	if(filters.league) {
		i++
		query.where.push('seasonschedule.league = $' + i)
		query.data.push(true)
	}

	else if(filters.final) {
		i++
		query.where.push('seasonschedule.final = $' + i)
		query.data.push(true)
	}

	let selects = await getSelects(gamemode)
	let sql = `
				SELECT
					COALESCE(team.acronym, 'SUB') as acronym,
					COALESCE(team.color, '#404040') as color,
					player.name as player,
					ROUND( sum(play_time) / 60, 0) as mins,
					${selects}
				FROM playergame
				LEFT JOIN game ON game.id = playergame.gameid
				LEFT JOIN seasonschedule ON playergame.gameid = seasonschedule.gameid
				LEFT JOIN player ON player.id = playergame.playerid
				LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid AND seasonplayer.seasonteamid IN (SELECT id FROM seasonteam WHERE seasonid = $1)
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE seasonschedule.date <= now() AND ${query.where.join(' AND ')}
				GROUP BY player.name, team.color, team.acronym
				ORDER BY mvb DESC
			`

	return await db.select(sql, query.data, 'all')
}

async function getRoundDate(id, seasonid) {
	let where = (id === 'final') ? 'final = true AND seasonid = $1' : 'date <= NOW() AND seasonid = $2'
	let limit = (id === 'final') ? '' : 'LIMIT 1 OFFSET $1'
	let condition = (id === 'final') ? [seasonid] : [id - 1, seasonid]
	let data = await db.select(`
		SELECT
			to_char(date, 'YYYY-MM-DD') as date
		FROM seasonschedule
		WHERE ${where}
		GROUP BY date
		ORDER BY date ASC
		${limit}
	`, condition, 'date')

	if(!data)
		throw 'invalid day'

	return data
}

async function getAllRounds(seasonid) {
	let sql = `
		select
			to_char(date, 'YYYY-MM-DD') as date,
			league,
			playoff,
			final
		FROM seasonschedule
		WHERE seasonid = $1 AND date <= NOW()
		GROUP BY date, final, league, playoff
		ORDER BY date ASC
	`
	let data = await db.select(sql, [seasonid], 'all')
	return data
}

async function getSelects(gamemode) {
	let mvb_select = mvb.getSelect(gamemode)
	switch(gamemode) {
		case 'ctf':
		case 'eltp':
			return `
					${mvb_select} as mvb,
					SUM(cap) as caps,
					TO_CHAR( sum(hold) * interval '1 sec', 'hh24:mi:ss') as hold,
					SUM(grab) as grabs,
					SUM(handoff_drop) + SUM(handoff_pickup) as handoffs,
					SUM(assist) as assists,
					TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss') as prevent,
					SUM(return) as returns,
					SUM(return_within_2_tiles_from_opponents_base) as saves,
					SUM(tag) as tags,
					SUM(reset_from_my_prevent) + SUM(reset_from_my_return) as resets,
					SUM(kiss) as kisses,
					SUM(pup_jj)+SUM(pup_rb)+SUM(pup_tp) as pups,
					SUM(pup_tp) as tps
			`
			break;
		case 'nf':
		case 'ecltp':
			return `
					${mvb_select} as mvb,
					SUM(cap) as caps,
					SUM(assist) as assists,
					ROUND((
							sum(hold)::DECIMAL / (
								sum(hold_team_for)::DECIMAL + sum(hold_team_against)::DECIMAL
							)
					) * 100, 0) || '%' as poss,
					SUM(tag) as tags,
					SUM(takeover) as takeovers,
					SUM(grab) as grabs,
					TO_CHAR( sum(hold) * interval '1 sec', 'hh24:mi:ss') as hold,
					SUM(chain) as chains,
					TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss') as prevent,
					TO_CHAR( sum(block) * interval '1 sec', 'hh24:mi:ss') as block,
					SUM(pup_jj)+SUM(pup_rb)+SUM(pup_tp) as pups
			`
			break;
	}
}
