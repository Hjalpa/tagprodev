require('dotenv').config({path:__dirname + '/../.env'})

const db = require('../lib/db')
const util = require('../lib/util')

init= (() => {})
init.call = async () => {
	try {

		// node thread [seasonid] [2023-03-20]
		if(!process.argv[2]) throw 'no seasonid param'
		if(!process.argv[3]) throw 'no date param'

		let filters = {
			seasonid: process.argv[2],
			date: process.argv[3]
		}

		let results = await db.select(`
			select
				map.name as map,
				"order",
				rst.id,

				rt.name as redname,
				rt.acronym as redabbr,
				bt.name as bluename,
				bt.acronym as blueabbr,

				game.euid,
				game.redcaps,
				game.bluecaps,
				game.winner,

				game.id as gameid

			FROM seasonschedule
			LEFT JOIN map on seasonschedule.mapid = map.id
			LEFT JOIN game on seasonschedule.gameid = game.id

			LEFT JOIN seasonteam as rst on seasonschedule.teamredid = rst.id
			LEFT JOIN team as rt on rt.id = rst.teamid
			LEFT JOIN seasonteam as bst on seasonschedule.teamblueid = bst.id
			LEFT JOIN team as bt on bt.id = bst.teamid

			WHERE seasonschedule.seasonid = $1 AND seasonschedule.date = $2
			ORDER BY "match" ASC, "order" ASC`,
			[filters.seasonid, filters.date], 'all')

		const matches = groupGamesByTeams(results);

		const raw = []

		for(let match of matches) {
			raw.push(`#${match[0].redname} vs ${match[0].bluename}`)
			raw.push('')
			raw.push('Map|Red|Score|Blue|Winner|')
			raw.push('----|---|---|-----|---|')
			let gameids = []
			for(let game of match) {
				gameids.push(game.gameid)
				let gamedata = {
					map: game.map,
					score: game.redcaps + ':' + game.bluecaps,
					euid: game.euid,
					result: (game.winner === 'r') ? `[](#team-${game.redabbr})` : (game.winner === 'b') ? `[](#team-${game.blueabbr})` : 'TIED'
				}

				raw.push(`${gamedata.map}|[](#team-${game.redabbr}) ${game.redname}|[${gamedata.score}](https://tagpro.eu/?match=${gamedata.euid})|[](#team-${game.blueabbr}) ${game.bluename}|${gamedata.result}`)
			}
			raw.push('')

			let topCapper = await db.select(`
				SELECT
					player.name,
					SUM(cap) as caps
				FROM playergame
				LEFT JOIN player on playergame.playerid = player.id
				WHERE playergame.gameid = ANY($1)
				GROUP BY player.name
				ORDER BY caps DESC
				limit 1`,
			[gameids], 'row')

			let topHolder = await db.select(`
				SELECT
					player.name,
					to_char(make_interval(secs => SUM(hold)), 'MI:SS') as holds

				FROM playergame
				LEFT JOIN player on playergame.playerid = player.id
				WHERE playergame.gameid = ANY($1)
				GROUP BY player.name
				ORDER BY holds DESC
				limit 1`,
			[gameids], 'row')

			let topPreventer = await db.select(`
				SELECT
					player.name,
					to_char(make_interval(secs => SUM(prevent)), 'MI:SS') as prevents

				FROM playergame
				LEFT JOIN player on playergame.playerid = player.id
				WHERE playergame.gameid = ANY($1)
				GROUP BY player.name
				ORDER BY prevents DESC
				limit 1`,
			[gameids], 'row')

			let topReturner = await db.select(`
				SELECT
					player.name,
					SUM(return) as returns
				FROM playergame
				LEFT JOIN player on playergame.playerid = player.id
				WHERE playergame.gameid = ANY($1)
				GROUP BY player.name
				ORDER BY returns DESC
				limit 1`,
			[gameids], 'row')

			let topPups = await db.select(`
				SELECT
					player.name,
					SUM(pup_jj + pup_tp + pup_rb) as pups
				FROM playergame
				LEFT JOIN player on playergame.playerid = player.id
				WHERE playergame.gameid = ANY($1)
				GROUP BY player.name
				ORDER BY pups DESC
				limit 1`,
			[gameids], 'row')

			raw.push(`[](#team-CAPS) **${topCapper.name}**: ${topCapper.caps} | [](#team-HOLD) **${topHolder.name}**: ${topHolder.holds} | [](#team-RETS) **${topReturner.name}**: ${topReturner.returns} | [](#team-PRVNT) **${topPreventer.name}**: ${topPreventer.prevents} | [](#team-PUPS) **${topPups.name}**: ${topPups.pups}`)

			raw.push('')
			raw.push('-------')
		}

		console.log(raw.join('\r\n'))
	}

	catch(e) {
		console.log(e)
	}

	finally {
		process.kill(process.pid)
	}
}

init.call()

function groupGamesByTeams(games) {
  const result = [];

  // iterate through each game in the input array
  for (const game of games) {
    const redName = game.redname;
    const blueName = game.bluename;

    // check if there's an existing group that has the same two teams
    const existingGroup = result.find(group => (
      group[0].redname === blueName && group[0].bluename === redName
    ));

   // check if there's an existing group that has the same two teams
    existingGroup1 = result.find(group => (
      group[0].redname === redName && group[0].bluename === blueName
    ));

    // if there is, add the game to that group
    if (existingGroup) {
      existingGroup.push(game);
    }
	else if (existingGroup1) {
      existingGroup1.push(game);
    }
    // otherwise, create a new group with this game
    else {
      result.push([game]);
    }
  }

  return result;
}
