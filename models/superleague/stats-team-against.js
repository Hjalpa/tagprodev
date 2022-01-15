// const db = require ('../../lib/db')
// const util = require ('../../lib/util')

// module.exports.init = async (req, res) => await init(req, res)
// let init = async (req, res) => {

// 	let data = {
// 		title: 'Stats',
// 		nav: {
// 			primary: 'superleague',
// 			secondary: 'stats',
// 			tertiary: 'Against',
// 		},
// 		stats: await getData()
// 	}

// 	res.render('superleague-stats-team-against', data)

// }

// async function getData(filters) {
// 	let sql = `
//         select


// 			COALESCE(t.acronym, 'SUB') as acronym,
// 			COALESCE(t.color, '#404040') as color,

//             player.name,
//             sum(cap) as total,
//             ROUND(avg(cap),2) as avg,

// 			-- ROUND((sum(prevent)::DECIMAL / sum(prevent_team_for)::DECIMAL) * 100, 0) as total,

//             team.name as against

//         from playergame
//         left join game on playergame.gameid = game.id
//         left join seasonschedule on playergame.gameid = seasonschedule.gameid
//         left join team on
//             (seasonschedule.teamredid = team.id AND playergame.team = 2) OR (seasonschedule.teamblueid = team.id AND playergame.team = 1)
//         left join player on playergame.playerid = player.id

// 		left join seasonplayer on seasonplayer.playerid = player.id
// 		left join seasonteam on seasonteam.id = seasonplayer.seasonteamid
// 		left join team as t on seasonplayer.seasonteamid = t.id

//         group by team.name, player.name, t.acronym, t.color
//         order by total DESC, avg DESC
// 		limit 30
// 	`
// 	let data = await db.select(sql, [], 'all')

// 	return data
// }





const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let filters =  {
			mode: getMode(req.params.id),
			seasonid: 5,
			ascending: false,
			percentage: false,
		}

		let data = {
			title: 'Leaderboard',
			nav: {
				primary: 'superleague',
				secondary: 'leaders',
				tertiary: filters.mode.name,
			},
			leaders: {
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
				// possession: {
				// 	title: 'Possession',
				// 	data: await getData({...filters, ...{percentage: true}}, {
				// 		sum: `
				// 			ROUND((
				// 					sum(hold)::DECIMAL / (
				// 						sum(hold_team_for)::DECIMAL + sum(hold_team_against)::DECIMAL
				// 					)
				// 			) * 100, 0)
				// 		`,
				// 	}),
				// },
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
						sum: `TO_CHAR( sum(hold) * interval '1 sec', 'mi:ss')`,
						avg: `TO_CHAR( avg(hold) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(hold)::DECIMAL / sum(hold_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.hold = (SELECT hold',
					}),
				},
				prevent: {
					title: 'Prevent',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(prevent) * interval '1 sec', 'mi:ss')`,
						avg: `TO_CHAR( avg(prevent) * interval '1 sec', 'mi:ss')`,
						teampercent: 'ROUND((sum(prevent)::DECIMAL / sum(prevent_team_for)::DECIMAL) * 100, 0)',
						top: 'playergame.prevent = (SELECT prevent',
					}),
				},
				block: {
					title: 'Block',
					data: await getData(filters, {
						sum: `TO_CHAR( sum(block) * interval '1 sec', 'mi:ss')`,
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
						sum: 'sum(return) - sum(takeover)',
						avg: 'ROUND(avg(return) - avg(takeover), 2)',
						teampercent: `
							ROUND(
								(
									(
										sum(return)::DECIMAL + sum(takeover)::DECIMAL
									)
									/
									(
										sum(return_team_for)::DECIMAL + sum(takeover_team_for)::DECIMAL
									)
								)
							* 100, 0)`,
						top: '(playergame.return - playergame.takeover) = (SELECT (return - takeover)',
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
						// sum: 'sum(cap_whilst_having_active_pup)',
						// avg: 'ROUND(avg(cap_whilst_having_active_pup), 2)',
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

				// capfrommyregrab: {
				// 	title: 'Cap from regrab',
				// 	data: await getData(filters, {
				// 		sum: 'sum(cap_from_my_regrab)',
				// 		avg: 'ROUND(avg(cap_from_my_regrab), 2)',
				// 		teamprecent: false,
				// 	}),
				// },
				// capfromprevent: {
				// 	title: 'Cap from Prevent',
				// 	data: await getData(filters, {
				// 		sum: 'sum(cap_from_prevent)',
				// 		avg: 'ROUND(avg(cap_from_prevent), 2)',
				// 		teampercent: 'ROUND((sum(cap_from_prevent)::DECIMAL / sum(cap_from_prevent_team_for)::DECIMAL) * 100, 0)',
				// 	}),
				// },
				// capfromblock: {
				// 	title: 'Cap from Block',
				// 	data: await getData(filters, {
				// 		sum: 'sum(cap_from_block)',
				// 		avg: 'ROUND(avg(cap_from_block), 2)',
				// 		teampercent: 'ROUND((sum(cap_from_block)::DECIMAL / sum(cap_from_block_team_for)::DECIMAL) * 100, 0)',
				// 	}),
				// },
			}
		}

		res.render('superleague-leaders', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getData(filters, sql) {
	let where = 'gameid in (SELECT id FROM game WHERE gameid = game.id AND seasonid = $1)'
	let select = sql[filters.mode.get]
	let ascending = (filters.ascending === true) ? 'ASC' : 'DESC'
	let having = (filters.having) ? ' AND ' + select + ' > 0' : ''
	let percentage = (filters.percentage) ? " || '%' " : ''

	if(filters.mode.get === 'teampercent')
		percentage = " || '%' ";

	else if(filters.mode.get === 'top') {
		where = sql[filters.mode.get] + ' as score FROM playergame WHERE gameid = game.id AND playerid = playergame.playerid AND game.seasonid = $1 ORDER BY score DESC limit 1)'
		select = 'count(*)'
		having = ''
		ascending = 'DESC'
		percentage = ''
	}

	if(!select) return false

		// SELECT
		// 	RANK() OVER (
		// 		ORDER BY
		// 			${select} ${ascending}
		// 	) rank,
		// 	player.name as player,
		// 	COALESCE(team.acronym, 'SUB') as acronym,
		// 	COALESCE(team.color, '#404040') as color,
		// 	${select} ${percentage} as value

		// FROM playergame
		// LEFT JOIN player ON player.id = playergame.playerid
		// LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
		// LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
		// LEFT JOIN team ON seasonteam.teamid = team.id
		// LEFT JOIN game ON game.id = playergame.gameid

		// WHERE ${where}
		// GROUP BY player.name, team.color, team.acronym
		// HAVING COUNT(*) >= 1 ${having}
		// ORDER BY rank ASC, player.name ASC
		// LIMIT 10




	let raw = `
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

		WHERE seasonschedule.seasonid = $1
        group by team.acronym, team.color, player.name, t.acronym, t.color
        order by rank ASC, player.name ASC
		limit 10
	`

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
		case 'team':
			mode = {
				name: 'team',
				get: 'team',
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
