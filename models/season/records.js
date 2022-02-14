const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let filters =  {
			seasonid: req.seasonid,
			ascending: false,
			percentage: false,
		}

		let data = {
			config: {
				title: req.mode.toUpperCase() + ' Season ' + req.season + ' Records',
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: req.mode,
					page: 'records'
				}
			},
			records: await getRecords(filters, req.mode)
		}

		res.render('superleague-records', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getData(filters, select) {
	let ascending = (filters.ascending === true) ? 'ASC' : 'DESC'
	let percentage = (filters.percentage) ? " || '%' " : ''

	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					${select} ${ascending}
			) rank,
			player.name as player,
			COALESCE(team.acronym, 'SUB') as acronym,
			COALESCE(team.color, '#404040') as color,
			map.name as map,
			TO_CHAR(date, 'DD Mon') as date,
			euid,
			${select} ${percentage} as value

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
		LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
		LEFT JOIN team ON seasonteam.teamid = team.id
		LEFT JOIN game ON game.id = playergame.gameid
		LEFT JOIN map ON map.id = game.mapid

		WHERE gameid in (
			SELECT game.id
			FROM game
			LEFT JOIN seasonschedule ON seasonschedule.gameid = game.id
			WHERE gameid = game.id AND game.seasonid = $1 AND league = TRUE
		) AND seasonteam.seasonid = $1
		ORDER BY rank ASC, game.date ASC
		LIMIT 10
	`, [filters.seasonid], 'all')

	return raw
}

async function getRecords(filters, mode) {
	switch(mode) {
		case 'ctf':
			return {
				points: {
					title: 'Points',
					data: await getData(filters, 'cap + assist'),
				},
				caps: {
					title: 'Caps',
					data: await getData(filters, 'cap'),
				},
				assists: {
					title: 'Assists',
					data: await getData(filters, 'assist'),
				},
				pups: {
					title: 'Pups',
					data: await getData(filters, 'pup_tp + pup_rb + pup_jj'),
				},
				tagpros: {
					title: 'Tagpros',
					data: await getData(filters, 'pup_tp'),
				},
				tags: {
					title: 'Tags',
					data: await getData(filters, 'tag'),
				},
				grabs: {
					title: 'Grabs',
					data: await getData(filters, 'grab'),
				},
				hold: {
					title: 'Hold',
					data: await getData(filters, `TO_CHAR(hold * interval '1 sec', 'mi:ss')`),
				},
				prevent: {
					title: 'Prevent',
					data: await getData(filters, `TO_CHAR(prevent * interval '1 sec', 'mi:ss')`),
				},
				returns: {
					title: 'Returns',
					data: await getData(filters, 'return'),
				},
				quickreturns: {
					title: 'Quick Returns',
					data: await getData(filters, 'quick_return'),
				},
				keyreturns: {
					title: 'Key Returns',
					data: await getData(filters, 'key_return'),
				},
				grabpercap: {
					title: 'Cap / Grab',
					data: await getData({...filters, ...{percentage: true}}, `
						Round((cap::DECIMAL / grab::DECIMAL) * 100, 0)
					`)
				},
				holdpergrab: {
					title: 'Hold / Grab',
					data: await getData(filters, `
						Round(hold::DECIMAL / grab::DECIMAL, 2)
					`)
				},
				holdpercap: {
					title: 'Hold / Cap',
					data: await getData({...filters, ...{having: true, ascending: true}}, `
						Round(hold::DECIMAL / NULLIF(cap::DECIMAL, 0), 2)
					`)
				},
				pupcaps: {
					title: 'Pup Caps',
					data: await getData(filters, 'cap_whilst_team_have_active_pup'),
				},
				kisses: {
					title: 'Kisses',
					data: await getData(filters, 'kiss'),
				},
				longhold: {
					title: 'Long Hold',
					data: await getData(filters, 'long_hold'),
				},
				tagpop: {
					title: 'Tag / Pop',
					data: await getData(filters, 'tag - pop'),
				},
				timedead: {
					title: 'Time Dead',
					data: await getData({...filters, ...{ascending: true}}, `
						TO_CHAR((pop * 3) * interval '1 sec', 'mi:ss')
					`),
				},
				score: {
					title: 'Score',
					data: await getData(filters, 'score'),
				},
			}
		break;
		case 'nf':
			return {
				points: {
					title: 'Points',
					data: await getData(filters, 'cap + assist'),
				},
				caps: {
					title: 'Caps',
					data: await getData(filters, 'cap'),
				},
				assists: {
					title: 'Assists',
					data: await getData(filters, 'assist'),
				},
				tags: {
					title: 'Tags',
					data: await getData(filters, 'tag'),
				},
				hold: {
					title: 'Hold',
					data: await getData(filters, `TO_CHAR(hold * interval '1 sec', 'mi:ss')`),
				},
				prevent: {
					title: 'Prevent',
					data: await getData(filters, `TO_CHAR(prevent * interval '1 sec', 'mi:ss')`),
				},
				block: {
					title: 'Block',
					data: await getData(filters, `TO_CHAR(block * interval '1 sec', 'mi:ss')`),
				},
				takeovers: {
					title: 'Takeovers',
					data: await getData(filters, 'takeover'),
				},
				takeoverdispossessed: {
					title: 'Takeover / Dispossessed',
					data: await getData(filters, 'takeover_good - dispossessed'),
				},
				strongtakeovers: {
					title: 'Strong Takeovers',
					data: await getData(filters, 'takeover_good'),
				},
				regrabs: {
					title: 'Regrabs',
					data: await getData(filters, 'grab - takeover'),
				},
				chains: {
					title: 'Chains',
					data: await getData(filters, 'chain'),
				},
				tapinfrommychain: {
					title: 'Team Tap-in from Chain',
					data: await getData(filters, 'tapin_from_my_chain'),
				},
				tapincaps: {
					title: 'Tap-in Merchants',
					data: await getData(filters, 'cap_from_tapin'),
				},
				quickreturns: {
					title: 'Quick Returns',
					data: await getData(filters, 'quick_return'),
				},
				nontakeoverreturns: {
					title: 'Non-Takeover Returns',
					data: await getData(filters, 'tag - return'),
				},
				pups: {
					title: 'Pups',
					data: await getData(filters, 'pup_tp + pup_rb + pup_jj'),
				},
				pupcaps: {
					title: 'Pup Caps',
					data: await getData(filters, 'cap_whilst_team_have_active_pup'),
				},
				grabpercap: {
					title: 'Cap / Grab',
					data: await getData({...filters, ...{percentage: true}}, `
						Round((cap::DECIMAL / grab::DECIMAL) * 100, 0)
					`)
				},
				holdpergrab: {
					title: 'Hold / Grab',
					data: await getData(filters, `
						Round(hold::DECIMAL / grab::DECIMAL, 2)
					`)
				},
				holdpercap: {
					title: 'Hold / Cap',
					data: await getData({...filters, ...{having: true, ascending: true}}, `
						Round(hold::DECIMAL / NULLIF(cap::DECIMAL, 0), 2)
					`)
				},
				longhold: {
					title: 'Long Hold',
					data: await getData(filters, 'long_hold'),
				},
				tagpop: {
					title: 'Tag / Pop',
					data: await getData(filters, 'tag - pop'),
				},
				timedead: {
					title: 'Time Dead',
					data: await getData({...filters, ...{ascending: true}}, `
						TO_CHAR((pop * 3) * interval '1 sec', 'mi:ss')
					`),
				},
			}
		break;
	}
}
