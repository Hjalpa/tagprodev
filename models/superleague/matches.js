const db = require ('../../lib/db')
const util = require ('../../lib/util')

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

		let data = {
			config: {
				title: 'NF Season ' + req.season + ' Matches',
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: 'nf',
					page: 'matches',
					sub: (req.params.id != 'playoffs') ? 'league' : 'playoffs'
				}
			},
			schedule: await getFixtures(filters),
		}
		res.render('superleague-matches', data)
		// res.json(data)
	}
	catch(error) {
		res.status(404).render('404')
	}
}

async function getFixtures(filters) {
	let orderby =  (filters.league) ? 'seasonschedule.date ASC, seasonschedule.order ASC' : 'seasonschedule.round ASC, seasonschedule.match ASC, seasonschedule.order ASC'

	let raw = await db.select(`
		SELECT
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
								hold_team_for::DECIMAL
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
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE playergame.gameid = game.id
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
								hold_team_for::DECIMAL
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
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE playergame.gameid = game.id
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
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE playergame.gameid = game.id
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
				LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
				LEFT JOIN team ON seasonteam.teamid = team.id
				WHERE playergame.gameid = game.id
				ORDER BY position_loss_time DESC
				LIMIT 1
			) as timelosing,

			-- mvb
			(SELECT player.name FROM playergame LEFT JOIN player ON player.id = playergame.playerid where playergame.gameid = game.id
			ORDER BY
			-- cap+assist+(takeover_good/3) DESC, takeover_good DESC, hold DESC

			(cap*100) + (assist * 50) + (takeover_good * 20) + (tag * 5) + ((pup_jj+pup_rb)*10) + ((hold / grab) * 5) + (chain * 10) + (prevent / 3) + kept_flag DESC




			limit 1) as mvb

		from seasonschedule

		left join seasonteam rst on rst.id = seasonschedule.teamredid
		left join team as redteam on redteam.id = rst.id

		left join seasonteam bst on bst.id = seasonschedule.teamblueid
		left join team as blueteam on blueteam.id = bst.id

		left join map on map.id = seasonschedule.mapid

		left join game on game.id = seasonschedule.gameid

		where seasonschedule.seasonid = $1 AND seasonschedule.league = $2 AND seasonschedule.playoff = $3

		order by ${orderby}
	`, [filters.seasonid, filters.league, filters.playoff], 'all')

	// return await raw
	return await format(raw, filters)
}


async function format(raw, filters) {
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

					mvb: d.mvb,
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

		// reverse it
		// return Object.keys(schedule).reverse().map(e => ({[e]: schedule[Number(e)]}) )
	}

	return schedule
}
