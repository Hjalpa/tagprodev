const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {

		let gamemode = (req.params.gamemode) ? req.params.gamemode : 'ctf'
		if(gamemode != 'ctf' && gamemode != 'nf' && gamemode != 'ecltp')
			throw 'wrong gamemode'

		let data = {
			config: {
				title: req.player.name + ' ' + gamemode + ' matches',
				player: req.player.name,
				path: req.baseUrl,
				nav: {
					cat: 'players',
					page: 'matches',
					sub: gamemode,
				},
			},
			matches: await getMatches(req.player.id, gamemode)
		}

		res.render('player-matches', data)
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function getMatches(playerid, gamemode) {
	let select = await getSelect(gamemode)

 	gamemode_where = ''
	switch(gamemode) {
		case 'ctf':
		case 'eltp':
			gamemode_where = `(season.mode = 'ctf' OR season.mode = 'eltp')`
			break;
		case 'nf':
		case 'ecltp':
			gamemode_where = `(season.mode = 'nf' OR season.mode = 'ecltp')`
			break;
	}


	let raw = await db.select(`
		SELECT
			COALESCE(team.acronym, 'SUB') as acronym,
			COALESCE(team.color, '#404040') as color,
			euid,
			CASE
				WHEN game.winner = 'r' AND playergame.team = 1 THEN 'w'
				WHEN game.winner = 'r' AND playergame.team = 2 THEN 'l'
				WHEN game.winner = 'b' AND playergame.team = 1 THEN 'l'
				WHEN game.winner = 'b' AND playergame.team = 2 THEN 'w'
				ELSE 't'
			END as result,
            (
                SELECT jsonb_build_object(
                    'color', team.color,
                    'acronym', team.acronym
                )
                FROM seasonschedule as ss
                LEFT JOIN seasonteam ON (
                    (ss.teamredid = seasonteam.id)
                    OR
                    (ss.teamblueid = seasonteam.id)
                ) AND seasonteam.seasonid = seasonschedule.seasonid AND seasonteam.teamid != team.id
                LEFT JOIN team ON seasonteam.teamid = team.id AND seasonteam.seasonid = seasonschedule.seasonid
                WHERE ss.gameid = game.id AND seasonteam.seasonid = season.id
                LIMIT 1
            ) as versus,
			${select}

		FROM playergame
		LEFT JOIN game ON playergame.gameid = game.id
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN season ON game.seasonid = season.id
		LEFT JOIN seasonschedule on playergame.gameid = seasonschedule.gameid
		LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid AND seasonplayer.seasonteamid IN (SELECT id FROM seasonteam WHERE seasonid = game.seasonid)
		LEFT JOIN seasonteam ON (
			(seasonschedule.teamredid = seasonteam.id AND playergame.team = 1)
			OR
			(seasonschedule.teamblueid = seasonteam.id AND playergame.team = 2)
		)
		LEFT JOIN team ON seasonteam.teamid = team.id
		WHERE playergame.playerid = $1 AND ${gamemode_where}
		ORDER BY game.datetime DESC
	`, [playerid], 'all')

	return raw
}

async function getSelect(gamemode) {
	let raw
	switch(gamemode) {
		case 'ctf':
		case 'eltp':
			raw = `
				cap_team_for - cap_team_against as "+/-",
				cap as caps,
				TO_CHAR(hold * interval '1 sec', 'hh24:mi:ss') as hold,
				grab as grabs,
				handoff_drop + handoff_pickup as handoffs,
				assist as assists,
				TO_CHAR(prevent * interval '1 sec', 'hh24:mi:ss') as prevent,
				return as returns,
				return_within_2_tiles_from_opponents_base as saves,
				tag as tags,
				reset_from_my_prevent + reset_from_my_return as resets,
				kiss as kisses,
				(pup_jj + pup_rb + pup_tp) as pups,
				pup_tp as tps
			`
			break;
		case 'nf':
		case 'ecltp':
			raw = `
				cap_team_for - cap_team_against as "+/-",
				cap as caps,
				cap_from_tapin as tapins,
				assist as assists,
				takeover as takeovers,
				TO_CHAR(hold * interval '1 sec', 'hh24:mi:ss') as hold,
				grab as grabs,
				Round(hold::decimal / grab::decimal, 2) as "avg hold",
				takeover - dispossessed as controls,
				tag as tags,
				chain as chains,
				TO_CHAR(prevent * interval '1 sec', 'hh24:mi:ss') as prevent,
				pup_jj + pup_rb + pup_tp as pups
			`
			break;
	}
	return raw
}
