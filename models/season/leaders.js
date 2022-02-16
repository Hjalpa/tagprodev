const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let filters =  {
			mode: getMode(req.params.id),
			seasonid: req.seasonid,
			ascending: false,
			percentage: false,
		}

		let data = {
			config: {
				title: req.mode.toUpperCase() + ' Season ' + req.season + ' Leaders / ' + filters.mode.name,
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: req.mode,
					page: 'leaders',
					sub: filters.mode.name

				}
			},
			leaders: await getLeaders(filters, req.mode)
		}

		res.render('superleague-leaders', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getData(filters, sql) {
	let where = 'playergame.gameid in (SELECT id FROM game WHERE playergame.gameid = game.id AND seasonid = $1)'
	let select = sql[filters.mode.get] || sql['sum']
	let ascending = (filters.ascending === true) ? 'ASC' : 'DESC'
	let having = (filters.having) ? ' AND ' + select + ' > 0' : ''
	let percentage = (filters.percentage) ? " || '%' " : ''

	if(!sql[filters.mode.get] && filters.mode.get != 'versus') return false

	if(filters.mode.get === 'teampercent')
		percentage = " || '%' ";

	else if(filters.mode.get === 'top') {
		where = sql[filters.mode.get] + ' as score FROM playergame WHERE gameid = game.id AND playerid = playergame.playerid AND game.seasonid = $1 ORDER BY score DESC limit 1)'
		select = 'count(*)'
		having = ''
		ascending = 'DESC'
		percentage = ''
	}

	// default
	let raw = `
		SELECT
			RANK() OVER (
				ORDER BY
					${select} ${ascending}
			) rank,
			player.name as player,
			COALESCE(team.acronym, 'SUB') as acronym,
			COALESCE(team.color, '#404040') as color,
			${select} ${percentage} as value

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
		LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
		LEFT JOIN team ON seasonteam.teamid = team.id
		LEFT JOIN game ON game.id = playergame.gameid
		LEFT JOIN seasonschedule ON game.id = seasonschedule.gameid

		WHERE ${where} AND seasonschedule.league = TRUE and seasonschedule.seasonid = $1 AND seasonteam.seasonid = $1

		-- removes SUBS
		AND seasonteam IS NOT NULL

		GROUP BY player.name, team.color, team.acronym
		HAVING COUNT(*) >= 1 ${having}
		ORDER BY rank ASC, player.name ASC
		LIMIT 10
	`

	// versus
	if(filters.mode.get === 'versus') {
		raw = `
			select
				RANK() OVER (
					ORDER BY
						${select} ${ascending}
				) rank,


				COALESCE(team.color, '#404040') as versuscolor,
				team.acronym as versus,

				COALESCE(t.acronym, 'SUB') as acronym,
				COALESCE(t.color, '#404040') as color,

				player.name as player,
				${select} ${percentage} as value

			from playergame
			left join game on playergame.gameid = game.id
			left join seasonschedule on playergame.gameid = seasonschedule.gameid
			left join team on
				(seasonschedule.teamredid = team.id AND playergame.team = 2) OR (seasonschedule.teamblueid = team.id AND playergame.team = 1)
			left join player on playergame.playerid = player.id

			left join seasonplayer on seasonplayer.playerid = player.id
			left join seasonteam on seasonteam.id = seasonplayer.seasonteamid
			left join team as t on seasonplayer.seasonteamid = t.id

			WHERE seasonschedule.seasonid = $1 AND seasonschedule.league = TRUE AND seasonteam.seasonid = $1

			-- removes SUBS
			AND seasonteam IS NOT NULL

			group by team.acronym, team.color, player.name, t.acronym, t.color
			HAVING COUNT(*) >= 1 ${having}
			order by rank ASC, player.name ASC
			limit 10
		`
	}

	let data = await db.select(raw, [filters.seasonid], 'all')

	return data
}

function getMode(id) {
	let mode = {}
	switch(id) {
		case 'averages':
			mode = {
				name: 'averages',
				get: 'avg',
			}
			break;
		case 'teampercent':
			mode = {
				name: 'teampercent',
				get: 'teampercent',
			}
			break;
		case 'top':
			mode = {
				name: 'top',
				get: 'top',
			}
			break;
		case 'versus':
			mode = {
				name: 'versus',
				get: 'versus',
			}
			break;
		default:
			mode = {
				name: 'totals',
				get: 'sum',
			}
	}
	return mode
}

async function getLeaders(filters, mode) {
	switch(mode) {
		case 'ctf':
			return {
				points: {
					title: 'Points',
					data: await getData(filters, {
						sum: 'sum(cap) + sum(assist)',
						avg: 'ROUND(avg(cap) + avg(assist), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(cap)::DECIMAL + sum(assist)::DECIMAL
									)
									/
									(
										sum(cap_team_for)::DECIMAL + sum(assist_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: 'playergame.cap + playergame.assist = (SELECT cap+assist'
					}),
				},
				caps: {
					title: 'Caps',
					data: await getData(filters, {
						sum: 'sum(cap)',
						avg: 'ROUND(avg(cap), 2)',
						teampercent: 'ROUND((sum(cap)::DECIMAL / sum(cap_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.hold = (SELECT hold',
					})
				},
				assists: {
					title: 'Assists',
					data: await getData(filters, {
						sum: 'sum(assist)',
						avg: 'ROUND(avg(assist), 2)',
						teampercent: 'ROUND((sum(assist)::DECIMAL / sum(assist_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.assist = (SELECT assist',
					})
				},
				timeleading: {
					title: 'Time Leading',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(position_win_time) * interval '1 sec', 'mi:ss')`,
						avg: `TO_CHAR( avg(position_win_time) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(position_win_time)::DECIMAL / sum(play_time)::DECIMAL) * 100, 0)',
						top: 'playergame.position_win_time = (SELECT MAX(position_win_time)',
					})
				},
				capdifference: {
					title: 'Cap Difference',
					data: await getData(filters, {
						sum: 'sum(cap_team_for) - sum(cap_team_against)',
						avg: 'ROUND(avg(cap_team_for) - avg(cap_team_against), 2)',
						teampercent: false,
						top: false,
					})
				},
				pups: {
					title: 'Pups',
					data: await getData(filters, {
						sum: 'sum(pup_tp) + sum(pup_rb) + sum(pup_jj)',
						avg: 'ROUND(avg(pup_tp) + avg(pup_rb) + avg(pup_jj), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(pup_tp)::DECIMAL + sum(pup_rb)::DECIMAL + sum(pup_jj)::DECIMAL
									)
									/
									(
										sum(pup_tp_team_for)::DECIMAL + sum(pup_rb_team_for)::DECIMAL + sum(pup_jj_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.pup_jj + playergame.pup_rb + playergame.pup_tp) = (SELECT (pup_jj + pup_rb + pup_tp)',
					})
				},
				tagpros: {
					title: 'Tagpros',
					data: await getData(filters, {
						sum: 'sum(pup_tp)',
						avg: 'ROUND(avg(pup_tp), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(pup_tp)::DECIMAL
									)
									/
									(
										sum(pup_tp_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.pup_tp) = (SELECT (pup_tp)',
					})
				},
				tags: {
					title: 'Tags',
					data: await getData(filters, {
						sum: 'sum(tag)',
						avg: 'ROUND(avg(tag), 2)',
						teampercent: 'ROUND((sum(tag)::DECIMAL / sum(tag_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.tag = (SELECT tag',
					}),
				},
				nonreturntags: {
					title: 'Non-Return Tags',
					data: await getData(filters, {
						sum: 'sum(tag) - sum(return)',
						avg: 'ROUND(avg(tag) - avg(return), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(tag)::DECIMAL - sum(return)::DECIMAL
									)
									/
									(
										sum(tag_team_for)::DECIMAL - sum(return_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.tag - playergame.return) = (SELECT (tag - return)',
					}),
				},
				returns: {
					title: 'Returns',
					data: await getData(filters, {
						sum: 'sum(return)',
						avg: 'ROUND(avg(return), 2)',
						teampercent: 'ROUND((sum(return)::DECIMAL / sum(return_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.return = (SELECT return',
					}),
				},
				returnswithinownhalf: {
					title: 'Returns Within Own Half',
					data: await getData(filters, {
						sum: 'sum(return_within_my_half)',
						avg: 'ROUND(avg(return_within_my_half), 2)',
						teampercent: 'ROUND((sum(return_within_my_half)::DECIMAL / sum(return_within_my_half_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.return_within_my_half = (SELECT return_within_my_half',
					}),
				},
				returnswithinopphalf: {
					title: 'Returns Witin Opp Half',
					data: await getData(filters, {
						sum: 'sum(return) - sum(return_within_my_half)',
						avg: 'ROUND(avg(return) - avg(return_within_my_half), 2)',
						teampercent: 'ROUND(((sum(return) - sum(return_within_my_half)::DECIMAL) / (sum(return_team_for) - sum(return_within_my_half_team_for)::DECIMAL)) * 100, 0)',
						top: 'playergame.return - playergame.return_within_my_half = (SELECT return - return_within_my_half',
					}),
				},
				prevent: {
					title: 'Prevent',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss')`,
						avg: `TO_CHAR( avg(prevent) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(prevent)::DECIMAL / sum(prevent_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.prevent = (SELECT prevent',
					}),
				},
				teamholdwilstprevent: {
					title: 'Team Hold Whislt Prevent',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(prevent_whilst_team_hold_time) * interval '1 sec', 'hh24:mi:ss')`,
						avg: `TO_CHAR( avg(prevent_whilst_team_hold_time) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(prevent_whilst_team_hold_time)::DECIMAL / sum(hold_whilst_prevent_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.prevent_whilst_team_hold_time = (SELECT prevent_whilst_team_hold_time',
					}),
				},
				hold: {
					title: 'Hold',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(hold) * interval '1 sec', 'hh24:mi:ss')`,
						avg: `TO_CHAR( avg(hold) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(hold)::DECIMAL / sum(hold_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.hold = (SELECT hold',
					}),
				},
				holdwhilstteamprevent: {
					title: 'Hold Whilst Team Prevent',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(hold_whilst_team_prevent_time) * interval '1 sec', 'hh24:mi:ss')`,
						avg: `TO_CHAR( avg(hold_whilst_team_prevent_time) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(hold_whilst_team_prevent_time)::DECIMAL / sum(hold_whilst_prevent_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.hold_whilst_team_prevent_time = (SELECT hold_whilst_team_prevent_time',
					}),
				},
				holdwhilstopponentsdont: {
					title: 'Hold Whilst Opp Dont',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(hold_whilst_opponents_dont) * interval '1 sec', 'hh24:mi:ss')`,
						avg: `TO_CHAR( avg(hold_whilst_opponents_dont) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(hold_whilst_opponents_dont)::DECIMAL / sum(hold_whilst_opponents_dont_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.hold_whilst_opponents_dont = (SELECT hold_whilst_opponents_dont',
					}),
				},
				grabs: {
					title: 'Grabs',
					data: await getData(filters, {
						sum: 'sum(grab)',
						avg: 'ROUND(avg(grab), 2)',
						teampercent: 'ROUND((sum(grab)::DECIMAL / sum(grab_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.grab = (SELECT grab',
					}),
				},
				grabwhilstopponentsprevent: {
					title: 'Grabs Whilst Opp Prevent',
					data: await getData(filters, {
						sum: 'sum(grab_whilst_opponents_prevent)',
						avg: 'ROUND(avg(grab_whilst_opponents_prevent), 2)',
						teampercent: 'ROUND((sum(grab_whilst_opponents_prevent)::DECIMAL / sum(grab_whilst_opponents_prevent_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.grab_whilst_opponents_prevent = (SELECT grab_whilst_opponents_prevent',
					})
				},
				grabwhilstopponentshold: {
					title: 'Grabs Whilst Opp Hold',
					data: await getData(filters, {
						sum: 'sum(grab_whilst_opponents_hold)',
						avg: 'ROUND(avg(grab_whilst_opponents_hold), 2)',
						teampercent: 'ROUND((sum(grab_whilst_opponents_hold)::DECIMAL / sum(grab_whilst_opponents_hold_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.grab_whilst_opponents_hold = (SELECT grab_whilst_opponents_hold',
					})
				},
				quickreturn: {
					title: 'Quick Returns',
					data: await getData(filters, {
						sum: 'sum(quick_return)',
						avg: 'ROUND(avg(quick_return), 2)',
						teampercent: 'ROUND((sum(quick_return)::DECIMAL / sum(quick_return_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.quick_return = (SELECT quick_return',
					})
				},
				keyreturns: {
					title: 'Key Returns',
					data: await getData(filters, {
						sum: 'sum(key_return)',
						avg: 'ROUND(avg(key_return), 2)',
						teampercent: 'ROUND((sum(key_return)::DECIMAL / sum(key_return_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.key_return = (SELECT key_return',
					})
				},
				saves: {
					title: 'Saves',
					data: await getData(filters, {
						sum: 'sum(return_within_5_tiles_from_opponents_base)',
						avg: 'ROUND(avg(return_within_5_tiles_from_opponents_base), 2)',
						teampercent: 'ROUND((sum(return_within_5_tiles_from_opponents_base)::DECIMAL / sum(return_within_5_tiles_from_opponents_base_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.return_within_5_tiles_from_opponents_base = (SELECT return_within_5_tiles_from_opponents_base',
					})
				},
				resets: {
					title: 'Resets',
					data: await getData(filters, {
						sum: 'sum(reset_from_my_prevent) + sum(reset_from_my_return)',
						avg: 'ROUND(avg(reset_from_my_prevent) + avg(reset_from_my_return), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(reset_from_my_prevent)::DECIMAL + sum(reset_from_my_return)::DECIMAL
									)
									/
									(
										sum(reset_from_my_prevent_team_for)::DECIMAL + sum(reset_from_my_return_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.reset_from_my_prevent + playergame.reset_from_my_return) = (SELECT (reset_from_my_prevent + reset_from_my_return)'
					})
				},
				handoffs: {
					title: 'Handoffs',
					data: await getData(filters, {
						sum: 'sum(handoff_drop) + sum(handoff_pickup)',
						avg: 'ROUND(avg(handoff_drop) + avg(handoff_pickup), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(handoff_drop)::DECIMAL + sum(handoff_pickup)::DECIMAL
									)
									/
									(
										sum(handoff_drop_team_for)::DECIMAL + sum(handoff_pickup_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.handoff_drop + playergame.handoff_pickup) = (SELECT (handoff_drop + handoff_pickup)'
					})
				},
				kisses: {
					title: 'Kisses',
					data: await getData(filters, {
						sum: 'sum(kiss)',
						avg: 'ROUND(avg(kiss), 2)',
						teampercent: 'ROUND((sum(kiss)::DECIMAL / sum(kiss_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.kiss = (SELECT kiss',
					})
				},
				nondroppops: {
					title: 'Non-Drop Pops',
					data: await getData({...filters, ...{having: true, ascending: true}}, {
						sum: 'sum(pop) - sum(drop)',
						avg: 'ROUND(avg(pop) - avg(drop), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(pop)::DECIMAL - sum(drop)::DECIMAL
									)
									/
									(
										sum(pop_team_for)::DECIMAL - sum(drop_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.pop - playergame.drop) = (SELECT (pop - drop)',
					}),
				},
				tagpop: {
					title: 'Tag / Pop',
					data: await getData(filters, {
						sum: 'sum(tag) - sum(pop)',
						avg: 'ROUND(avg(tag) - avg(pop), 2)',
						teampercent: `
							ROUND(
								(
									(
				 						sum(tag) - sum(pop)
									)::DECIMAL
									/
									(
										sum(tag_team_for) - sum(pop_team_for)
									)::DECIMAL
								)
								* 100
							, 0)
						`,
						top: '(playergame.tag - playergame.pop) = (SELECT (tag - pop)'
					}),
				},
				grabpercap: {
					title: 'Cap / Grab',
					data: await getData({...filters, ...{percentage: true}}, {
						sum: `
							COALESCE(
								ROUND(
									(NULLIF(sum(cap)::DECIMAL, 0) / sum(grab)::DECIMAL) * 100
								, 2)
							, 0)
						`,
						avg: `
							COALESCE(
								ROUND(
									(NULLIF(avg(cap)::DECIMAL, 0) / avg(grab)::DECIMAL) * 100
								, 2)
							, 0)
						`,
						teampercent: false,
						top: `(playergame.cap::DECIMAL / playergame.grab::DECIMAL) = (SELECT (cap::DECIMAL / grab::DECIMAL)`,
					})
				},
				holdpergrab: {
					title: 'Hold / Grab',
					data: await getData(filters, {
						sum: 'ROUND(sum(hold) / sum(grab)::numeric, 2)',
						avg: 'ROUND(avg(hold) / avg(grab)::numeric, 2)',
						teampercent: false,
						top: 'ROUND(playergame.hold / playergame.grab, 2) = (SELECT ROUND(hold / grab, 2)',
					}),
				},
				holdpercap: {
					title: 'Hold / Cap',
					data: await getData({...filters, ...{having: true, ascending: true}}, {
						sum: `
							COALESCE(
								ROUND(
									(sum(hold)::DECIMAL / NULLIF(sum(cap)::DECIMAL, 0))
								, 2)
							, 0)
						`,
						avg: `
							COALESCE(
								ROUND(
									(avg(hold)::DECIMAL / NULLIF(avg(cap)::DECIMAL, 0))
								, 2)
							, 0)
						`,
						teampercent: false,
						top: `COALESCE(playergame.hold / NULLIF(playergame.cap, 0), 0) = (SELECT COALESCE(hold / NULLIF(cap, 0), 0)`
					})
				},
				capfrompup: {
					title: 'Cap form Pup',
					data: await getData(filters, {
						sum: 'sum(cap_whilst_team_have_active_pup)',
						avg: 'ROUND(avg(cap_whilst_team_have_active_pup), 2)',
						teampercent: 'ROUND((sum(cap_whilst_team_have_active_pup)::DECIMAL / sum(cap_whilst_team_have_active_pup_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.cap_whilst_team_have_active_pup = (SELECT cap_whilst_team_have_active_pup',
					})
				},
				capfrommyregrab: {
					title: 'Cap from regrab',
					data: await getData(filters, {
						sum: 'sum(cap_from_my_regrab)',
						avg: 'ROUND(avg(cap_from_my_regrab), 2)',
						teampercent: 'ROUND((sum(cap_from_my_regrab)::DECIMAL / sum(cap_from_my_regrab_team_for)::DECIMAL) * 100, 0)',
						top: '(cap_from_my_regrab) = (SELECT (cap_from_my_regrab)'
					}),
				},
				capfromprevent: {
					title: 'Cap from Prevent',
					data: await getData(filters, {
						sum: 'sum(cap_from_prevent)',
						avg: 'ROUND(avg(cap_from_prevent), 2)',
						teampercent: 'ROUND((sum(cap_from_prevent)::DECIMAL / sum(cap_from_prevent_team_for)::DECIMAL) * 100, 0)',
						top: '(cap_from_prevent) = (SELECT (cap_from_prevent)'
					}),
				},
				capfromhandoff: {
					title: 'Cap from Handoff',
					data: await getData(filters, {
						sum: 'sum(cap_from_handoff)',
						avg: 'ROUND(avg(cap_from_handoff), 2)',
						teampercent: 'ROUND((sum(cap_from_handoff)::DECIMAL / sum(cap_from_handoff_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.cap_from_handoff = (SELECT cap_from_handoff',
					}),
				},
				assistfromprevent: {
					title: 'Assist from Prevent',
					data: await getData(filters, {
						sum: 'sum(cap_from_my_prevent)',
						avg: 'ROUND(avg(cap_from_my_prevent), 2)',
						teampercent: 'ROUND((sum(cap_from_my_prevent)::DECIMAL / sum(cap_from_prevent_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.cap_from_my_prevent = (SELECT cap_from_my_prevent',
					}),
				},
				assistfromhandoff: {
					title: 'Assist from Handoff',
					data: await getData(filters, {
						sum: 'sum(cap_from_my_handoff)',
						avg: 'ROUND(avg(cap_from_my_handoff), 2)',
						teampercent: 'ROUND((sum(cap_from_my_handoff)::DECIMAL / sum(cap_from_my_handoff_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.cap_from_my_handoff = (SELECT cap_from_my_handoff',
					}),
				},
				longhold: {
					title: 'Long Holds',
					data: await getData(filters, {
						sum: 'sum(long_hold)',
						avg: 'ROUND(avg(long_hold), 2)',
						teampercent: `
						    ROUND(
								(
									COALESCE(
										NULLIF(sum(long_hold)::DECIMAL, 0)
										/
										NULLIF(sum(long_hold_team_for)::DECIMAL, 0)
									, 0)
								* 100)
							, 0)
						`,
						top: 'playergame.long_hold = (SELECT long_hold',
					}),
				},
				timedead: {
					title: 'Time Dead',
					data: await getData({...filters, ...{ascending: true}}, {
						sum: `TO_CHAR( (sum(pop) * 3) * interval '1 sec', 'mi:ss')`,
						avg: `TO_CHAR( (avg(pop) * 3) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(pop)::DECIMAL / sum(pop_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.pop = (SELECT MAX(pop)',
					})
				},
				flaccid: {
					title: 'Flaccids',
					data: await getData(filters, {
						sum: 'sum(flaccid)',
						avg: 'ROUND(avg(flaccid), 2)',
						teampercent: 'ROUND((sum(flaccid)::DECIMAL / sum(flaccid_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.flaccid = (SELECT flaccid',
					})
				},
			}
			break;

		case 'nf':
			return {
				points: {
					title: 'Points',
					data: await getData(filters, {
						sum: 'sum(cap) + sum(assist)',
						avg: 'ROUND(avg(cap) + avg(assist), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(cap)::DECIMAL + sum(assist)::DECIMAL
									)
									/
									(
										sum(cap_team_for)::DECIMAL + sum(assist_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: 'playergame.cap + playergame.assist = (SELECT cap+assist'
					}),
				},
				caps: {
					title: 'Caps',
					data: await getData(filters, {
						sum: 'sum(cap)',
						avg: 'ROUND(avg(cap), 2)',
						teampercent: 'ROUND((sum(cap)::DECIMAL / sum(cap_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.hold = (SELECT hold',
					})
				},
				assists: {
					title: 'Assists',
					data: await getData(filters, {
						sum: 'sum(assist)',
						avg: 'ROUND(avg(assist), 2)',
						teampercent: 'ROUND((sum(assist)::DECIMAL / sum(assist_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.assist = (SELECT assist',
					})
				},
				tags: {
					title: 'Tags',
					data: await getData(filters, {
						sum: 'sum(tag)',
						avg: 'ROUND(avg(tag), 2)',
						teampercent: 'ROUND((sum(tag)::DECIMAL / sum(tag_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.tag = (SELECT tag',
					}),
				},
				hold: {
					title: 'Hold',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(hold) * interval '1 sec', 'hh24:mi:ss')`,
						avg: `TO_CHAR( avg(hold) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(hold)::DECIMAL / sum(hold_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.hold = (SELECT hold',
					}),
				},
				prevent: {
					title: 'Prevent',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(prevent) * interval '1 sec', 'hh24:mi:ss')`,
						avg: `TO_CHAR( avg(prevent) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(prevent)::DECIMAL / sum(prevent_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.prevent = (SELECT prevent',
					}),
				},
				block: {
					title: 'Block',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(block) * interval '1 sec', 'hh24:mi:ss')`,
						avg: `TO_CHAR( avg(block) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(block)::DECIMAL / sum(block_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.block = (SELECT block',
					}),
				},
				takeovers: {
					title: 'Takeovers',
					data: await getData(filters, {
						sum: 'sum(takeover)',
						avg: 'ROUND(avg(takeover), 2)',
						teampercent: 'ROUND((sum(takeover)::DECIMAL / sum(takeover_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.takeover = (SELECT takeover',
					})
				},
				dispossessed: {
					title: 'Takeover / Dispossessed',
					data: await getData(filters, {
						sum: 'sum(takeover_good) - sum(dispossessed)',
						avg: 'ROUND(avg(takeover_good) - avg(dispossessed), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(takeover_good)::DECIMAL - sum(dispossessed)::DECIMAL
									)
									/
									(
										sum(takeover_good_team_for)::DECIMAL - sum(dispossessed_team_for)::DECIMAL
									)
								)
								* 100
							, 0)
						`,
						top: '(playergame.takeover_good - playergame.dispossessed) = (SELECT (takeover_good - dispossessed)'
					})
				},
				strongtakeovers: {
					title: 'Strong Takeovers',
					data: await getData(filters, {
						sum: 'sum(takeover_good)',
						avg: 'ROUND(avg(takeover_good), 2)',
						teampercent: 'ROUND((sum(takeover_good)::DECIMAL / sum(takeover_good_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.takeover_good = (SELECT takeover_good',
					})
				},
				regrabs: {
					title: 'Regrabs',
					data: await getData(filters, {
						sum: 'sum(grab) - sum(takeover)',
						avg: 'ROUND(avg(grab) - avg(takeover), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(grab)::DECIMAL + sum(takeover)::DECIMAL
									)
									/
									(
										sum(grab_team_for)::DECIMAL + sum(takeover_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.grab - playergame.takeover) = (SELECT (grab - takeover)'
					})
				},
				chains: {
					title: 'Chains',
					data: await getData(filters, {
						sum: 'sum(chain)',
						avg: 'ROUND(avg(chain), 2)',
						teampercent: 'ROUND((sum(chain)::DECIMAL / sum(chain_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.chain = (SELECT chain',
					}),
				},
				tapinfromychain: {
					title: 'Team Tap-in from Chain',
					data: await getData(filters, {
						sum: 'sum(tapin_from_my_chain)',
						avg: 'ROUND(avg(tapin_from_my_chain), 2)',
						teampercent: 'ROUND((sum(tapin_from_my_chain)::DECIMAL / sum(tapin_from_my_chain_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.tapin_from_my_chain = (SELECT tapin_from_my_chain',
					}),
				},
				tapincaps: {
					title: 'Tap-in Merchants',
					data: await getData(filters, {
						sum: 'sum(cap_from_tapin)',
						avg: 'ROUND(avg(cap_from_tapin), 2)',
						teampercent: 'ROUND((sum(cap_from_tapin)::DECIMAL / sum(cap_from_tapin_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.cap_from_tapin = (SELECT cap_from_tapin',
					})
				},
				quickreturn: {
					title: 'Quick Returns',
					data: await getData(filters, {
						sum: 'sum(quick_return)',
						avg: 'ROUND(avg(quick_return), 2)',
						teampercent: 'ROUND((sum(quick_return)::DECIMAL / sum(quick_return_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.quick_return = (SELECT quick_return',
					})
				},
				nontakeoverturns: {
					title: 'Non-Takeover Returns',
					data: await getData(filters, {
						sum: 'sum(tag) - sum(return)',
						avg: 'ROUND(avg(tag) - avg(return), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(tag)::DECIMAL - sum(return)::DECIMAL
									)
									/
									(
										sum(tag_team_for)::DECIMAL - sum(return_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.tag - playergame.return) = (SELECT (tag - return)',
					}),
				},
				pups: {
					title: 'Pups',
					data: await getData(filters, {
						sum: 'sum(pup_tp) + sum(pup_rb) + sum(pup_jj)',
						avg: 'ROUND(avg(pup_tp) + avg(pup_rb) + avg(pup_jj), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(pup_tp)::DECIMAL + sum(pup_rb)::DECIMAL + sum(pup_jj)::DECIMAL
									)
									/
									(
										sum(pup_tp_team_for)::DECIMAL + sum(pup_rb_team_for)::DECIMAL + sum(pup_jj_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.pup_jj + playergame.pup_rb + playergame.pup_tp) = (SELECT (pup_jj + pup_rb + pup_tp)',
					})
				},
				pupcaps: {
					title: 'Pup Caps',
					data: await getData(filters, {
						sum: 'sum(cap_whilst_team_have_active_pup)',
						avg: 'ROUND(avg(cap_whilst_team_have_active_pup), 2)',
						teampercent: 'ROUND((sum(cap_whilst_team_have_active_pup)::DECIMAL / sum(cap_whilst_team_have_active_pup_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.cap_whilst_team_have_active_pup = (SELECT cap_whilst_team_have_active_pup',
					})
				},
				grabpercap: {
					title: 'Cap / Grab',
					data: await getData({...filters, ...{percentage: true}}, {
						sum: `
							COALESCE(
								ROUND(
									(NULLIF(sum(cap)::DECIMAL, 0) / sum(grab)::DECIMAL) * 100
								, 2)
							, 0)
						`,
						avg: `
							COALESCE(
								ROUND(
									(NULLIF(avg(cap)::DECIMAL, 0) / avg(grab)::DECIMAL) * 100
								, 2)
							, 0)
						`,
						teampercent: false,
						top: `(playergame.cap::DECIMAL / playergame.grab::DECIMAL) = (SELECT (cap::DECIMAL / grab::DECIMAL)`,
					})
				},
				holdpergrab: {
					title: 'Hold / Grab',
					data: await getData(filters, {
						sum: 'ROUND(sum(hold) / sum(grab)::numeric, 2)',
						avg: 'ROUND(avg(hold) / avg(grab)::numeric, 2)',
						teampercent: false,
						top: 'ROUND(playergame.hold / playergame.grab, 2) = (SELECT ROUND(hold / grab, 2)',
					}),
				},
				holdpercap: {
					title: 'Hold / Cap',
					data: await getData({...filters, ...{having: true, ascending: true}}, {
						sum: `
							COALESCE(
								ROUND(
									(sum(hold)::DECIMAL / NULLIF(sum(cap)::DECIMAL, 0))
								, 2)
							, 0)
						`,
						avg: `
							COALESCE(
								ROUND(
									(avg(hold)::DECIMAL / NULLIF(avg(cap)::DECIMAL, 0))
								, 2)
							, 0)
						`,
						teampercent: false,
						top: `COALESCE(playergame.hold / NULLIF(playergame.cap, 0), 0) = (SELECT COALESCE(hold / NULLIF(cap, 0), 0)`
					})
				},
				longhold: {
					title: 'Long Holds',
					data: await getData(filters, {
						sum: 'sum(long_hold)',
						avg: 'ROUND(avg(long_hold), 2)',
						teampercent: `
						    ROUND(
								(
									COALESCE(
										NULLIF(sum(long_hold)::DECIMAL, 0)
										/
										NULLIF(sum(long_hold_team_for)::DECIMAL, 0)
									, 0)
								* 100)
							, 0)
						`,
						top: 'playergame.long_hold = (SELECT long_hold',
					}),
				},
				tagpop: {
					title: 'Tag / Pop',
					data: await getData(filters, {
						sum: 'sum(tag) - sum(pop)',
						avg: 'ROUND(avg(tag) - avg(pop), 2)',
						teampercent: `
							ROUND(
								(
									(
				 						sum(tag) - sum(pop)
									)::DECIMAL
									/
									(
										sum(tag_team_for) - sum(pop_team_for)
									)::DECIMAL
								)
								* 100
							, 0)
						`,
						top: '(playergame.tag - playergame.pop) = (SELECT (tag - pop)'
					}),
				},
				timedead: {
					title: 'Time Dead',
					data: await getData({...filters, ...{ascending: true}}, {
						sum: `TO_CHAR( (sum(pop) * 3) * interval '1 sec', 'mi:ss')`,
						avg: `TO_CHAR( (avg(pop) * 3) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(pop)::DECIMAL / sum(pop_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.pop = (SELECT MAX(pop)',
					})
				},
			}
			break;
	}
}
