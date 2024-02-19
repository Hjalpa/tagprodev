const db = require ('../../lib/db')
const util = require ('../../lib/util')
const gasp = require ('../../lib/gasp')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		// check page exists
		if(req.params.id)
			if(req.params.id != 'playoffs')	throw 'invalid page'

		let filters = {
			seasonid: req.seasonid,
			league: (req.params.id) ? false : true,
			playoff: (req.params.id) ? true : false
		}

		let tier = req.seasonTier ? ` ${req.seasonTier}` : ''
		let data = {
			config: {
				title: req.mode.toUpperCase() + ' ' + req.season + (tier ? ' ' + tier : '') + ' ' + ((req.params.id) ? 'Playoff ' : '') + 'Matches',
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				tier: req.seasonTier,
				nav: {
					cat: req.mode,
					page: 'matches',
					sub: (req.params.id != 'playoffs') ? 'league' : 'playoffs'
				}
			},
			schedule: await getFixtures(filters, req.mode),
		}
		res.render('superleague-matches', data)
	}
	catch(error) {
		res.status(404).render('404')
	}
}

async function getFixtures(filters, gamemode) {
	let orderby =  (filters.league) ? 'seasonschedule.date ASC, seasonschedule.order ASC' : 'seasonschedule.round ASC, seasonschedule.match ASC, seasonschedule.order ASC'

	let raw = await db.select(`
		SELECT
			game.id as gameid,
			seasonschedule.id as seasonscheduleid,
			seasonschedule.date,
			map.name as map,
			map.unfortunateid as unfortunateid,
			seasonschedule.order as order,
			seasonschedule.round as round,
			seasonschedule.match as match,
			seasonschedule.final as final,

			redteam.name as redname,
			redteam.acronym as redacronym,
			redteam.logo as redlogo,
			redteam.color as redcolor,

			blueteam.name as bluename,
			blueteam.acronym as blueacronym,
			blueteam.logo as bluelogo,
			blueteam.color as bluecolor,

			game.redcaps as redcaps,
			game.bluecaps as bluecaps,
			game.euid as euid,

			-- time hold winning
			(

				SELECT jsonb_build_object(
					'color', team.color,
					'percent', ROUND(
						(
							(
								CASE WHEN hold_team_for = hold_team_against
								THEN
									hold_team_for::DECIMAL - hold_whilst_opponents_dont_team_for::DECIMAL
								ELSE
									hold_team_for::DECIMAL
								END
							)
							/
							(
								play_time::DECIMAL
							)
						)
					* 100, 0) - 10
				)
				FROM playergame
				LEFT JOIN player ON player.id = playergame.playerid
				LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid AND seasonteam.seasonid = $1
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE playergame.gameid = game.id AND seasonschedule.seasonid = $1 AND seasonteam.seasonid = $1
				ORDER BY hold_team_for DESC
				LIMIT 1
			) as holdwin,

			-- time hold losing
			(
				SELECT jsonb_build_object(
					'color', team.color,
					'percent', ROUND(
						(
							(
								CASE WHEN hold_team_for = hold_team_against
								THEN
									hold_team_for::DECIMAL - hold_whilst_opponents_dont_team_for::DECIMAL
								ELSE

									hold_team_for::DECIMAL
								END
							)
							/
							(
								play_time::DECIMAL
							)
						)
					* 100, 0) - 10
				)
				FROM playergame
				LEFT JOIN player ON player.id = playergame.playerid
				LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid AND seasonteam.seasonid = $1
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE playergame.gameid = game.id AND seasonschedule.seasonid = $1 AND seasonteam.seasonid = $1
				ORDER BY hold_team_against DESC
				LIMIT 1
			) as holdlost,

			-- time winning
			(
				SELECT jsonb_build_object(
					'color', team.color,
					'percent', ROUND(
						(
							(
								position_win_time::DECIMAL
							)
							/
							(
								play_time::DECIMAL
							)
						)
					* 100, 0)
				)
				FROM playergame
				LEFT JOIN player ON player.id = playergame.playerid
				LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid AND seasonteam.seasonid = $1
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE playergame.gameid = game.id AND seasonschedule.seasonid = $1 AND seasonteam.seasonid = $1
				ORDER BY position_win_time DESC
				LIMIT 1
			) as timewinning,

			-- time losing
			(
				SELECT jsonb_build_object(
					'color', team.color,
					'percent', ROUND(
						(
							(
								position_win_time::DECIMAL
							)
							/
							(
								play_time::DECIMAL
							)
						)
					* 100, 0)
				)
				FROM playergame
				LEFT JOIN player ON player.id = playergame.playerid
				LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid AND seasonteam.seasonid = $1
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE playergame.gameid = game.id AND seasonschedule.seasonid = $1 AND seasonteam.seasonid = $1
				ORDER BY position_loss_time DESC
				LIMIT 1
			) as timelosing

		from seasonschedule
		left join seasonteam rst on rst.id = seasonschedule.teamredid AND seasonschedule.seasonid = $1
		left join team as redteam on redteam.id = rst.teamid
		left join seasonteam bst on bst.id = seasonschedule.teamblueid AND seasonschedule.seasonid = $1
		left join team as blueteam on blueteam.id = bst.teamid
		left join map on map.id = seasonschedule.mapid
		left join game on game.id = seasonschedule.gameid
		where seasonschedule.seasonid = $1 AND seasonschedule.league = $2 AND seasonschedule.playoff = $3
		order by ${orderby}
	`, [filters.seasonid, filters.league, filters.playoff], 'all')

	return await format(raw, filters, gamemode)
}

async function format(raw, filters, gamemode) {
	const schedule = {}

	if(filters.league) {
		for (let k in raw) {
			let d = raw[k]

			let date = util.displayDate(raw[k].date, 'weekday day month')

			if(!schedule[date])
				schedule[date] = {
					round: {}
				}

			if(!schedule[date]['round'][d.order])
				schedule[date]['round'][d.order] = {
					map: {
						name: d.map,
						unfortunateid: d.unfortunateid
					},
					fixtures: [],
				}

			schedule[date]['round'][d.order]['fixtures'].push({
				euid: d.euid,
				seasonscheduleid: d.seasonscheduleid,
				red: {
					name: d.redname,
					acronym: d.redacronym,
					logo: d.redlogo,
					color: d.redcolor,
					caps: d.redcaps
				},
				blue: {
					name: d.bluename,
					acronym: d.blueacronym,
					logo: d.bluelogo,
					color: d.bluecolor,
					caps: d.bluecaps
				}
			})
		}
	}

	else if(filters.playoff) {
		raw = await setGASP(raw, gamemode)

		for (let k in raw) {
			let d = raw[k]

			let date = util.displayDate(raw[k].date, 'weekday day month')
			let round = (d.final) ? 'Final' : d.round

			if(!schedule[round])
				schedule[round] = {
					date,
					match: {}
				}

			if(!schedule[round]['match'][d.match])
				schedule[round]['match'][d.match] = []

			schedule[round]['match'][d.match].push({
				euid: d.euid,
				seasonscheduleid: d.seasonscheduleid,
				map: {
					name: d.map,
					unfortunateid: d.unfortunateid
				},
				stats: {
					holdwin: (d.holdwin && d.holdwin.color === d.redcolor ? d.holdwin : d.holdlost),
					holdlost: (d.holdlost && d.holdlost.color === d.redcolor ? d.holdwin : d.holdlost),

					timewinning: (d.timewinning && d.timewinning.color === d.redcolor ? d.timewinning : d.timelosing),
					timelosing: (d.timelosing && d.timelosing.color === d.redcolor ? d.timewinning : d.timelosing),

					gasp: d.gasp,
				},
				red: {
					name: d.redname,
					acronym: d.redacronym,
					logo: d.redlogo,
					color: d.redcolor,
					caps: d.redcaps
				},
				blue: {
					name: d.bluename,
					acronym: d.blueacronym,
					logo: d.bluelogo,
					color: d.bluecolor,
					caps: d.bluecaps
				}
			})
		}
	}

	return schedule
}

async function setGASP(raw, gamemode) {
	for(let game in raw) {
		if(game.euid === null) continue

		let gameid = raw[game].gameid

		if(gamemode === 'eltp' || 'ctf') {
			let gasp_select_o = gasp.getSelectSingle(gamemode, 'o')
			let gasp_select_d = gasp.getSelectSingle(gamemode, 'd')

			let topGASP = await db.select(`
					SELECT
						_data.player,
						Round(
								(real_dgasp * (avg(real_dgasp) over() / 10))::DECIMAL
								+
								(real_ogasp * (avg(real_ogasp) over() / 10))::DECIMAL
						, 2) as raw_gasp
					FROM (
						SELECT
							data.*,
							Round(
								((dgasp - min(dgasp) over()) / (max(dgasp) over() - min(dgasp) over ())) * 10
							, 2) as real_dgasp,
							Round(
								((ogasp - min(ogasp) over()) / (max(ogasp) over() - min(ogasp) over ())) * 10
							, 2) as real_ogasp
						FROM (
							SELECT
								player.name as player,
								${gasp_select_d} as dgasp,
								${gasp_select_o} as ogasp
							FROM playergame
							LEFT JOIN game ON game.id = playergame.gameid
							LEFT JOIN player ON player.id = playergame.playerid
							WHERE playergame.gameid = $1
						) as data
					) as _data
					ORDER BY raw_gasp desc
					LIMIT 1
			`, [gameid], 'player')

			raw[game].gasp = topGASP
		}
		else if(gamemode === 'ecltp' || 'nf') {
			let gasp_select = gasp.getSelectSingle(gamemode)

			let topGASP = await db.select(`
				SELECT
					player.name as player,
					${gasp_select} as raw_gasp
				FROM playergame
				LEFT JOIN game ON game.id = playergame.gameid
				LEFT JOIN player ON player.id = playergame.playerid
				WHERE playergame.gameid = $1
				ORDER BY raw_gasp DESC
				LIMIT 1
			`, [gameid], 'player')

			raw[game].gasp = topGASP
		}
	}

	return raw
}
