const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let filters =  {
			seasonid: req.seasonid,
			date: (req.params.id) ? await getRoundDate(req.params.id, req.seasonid) : false,
		}

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
			rounds: await getAllRounds(filters.seasonid),
			stats: await getData(filters, req.mode)
		}
		res.render('superleague-stats', data)
	}
	catch(error) {
		res.status(404).render('404')
	}
}

async function getData(filters, mode) {
	let query = {
		where: ['game.seasonid = $1'],
		data: [filters.seasonid],
	}

	if(filters.date) {
		query.where.push('seasonschedule.date = $2')
		query.data.push(filters.date)
	}

	let selects = await getSelects(mode)
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
				WHERE seasonschedule.date <= now() AND seasonschedule.league = TRUE AND ${query.where.join(' AND ')}
				GROUP BY player.name, team.color, team.acronym
				ORDER BY team.acronym ASC, caps DESC
			`

	return await db.select(sql, query.data, 'all')
}

async function getRoundDate(id, seasonid) {
	let sql = `
		select
			to_char(date, 'YYYY-MM-DD') as date
		FROM seasonschedule
		WHERE date <= NOW() AND seasonid = $2
		GROUP BY date
		ORDER BY date ASC
		LIMIT 1 OFFSET $1
	`
	let data = await db.select(sql, [id - 1, seasonid], 'date')

	if(!data)
		throw 'invalid day'

	return data
}

async function getAllRounds(seasonid) {
	let sql = `
		select
			to_char(date, 'YYYY-MM-DD') as date
		FROM seasonschedule
		WHERE seasonid = $1 AND date <= NOW() AND league = TRUE
		GROUP BY date
		ORDER BY date ASC
	`
	let data = await db.select(sql, [seasonid], 'all')
	return data
}

async function getSelects(mode) {
	switch(mode) {
		case 'ctf':
			return `
					SUM(cap) as caps,
					TO_CHAR( sum(hold) * interval '1 sec', 'hh24:mi:ss') as hold,
					SUM(grab) as grabs,
					SUM(assist) as assists,
					TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss') as prevent,
					SUM(return) as returns,
					SUM(tag) as tags,
					SUM(tag) - SUM(pop) as KD,
					SUM(pup_jj)+SUM(pup_rb)+SUM(pup_tp) as pups
			`
			break;
		case 'nf':
			return `
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
