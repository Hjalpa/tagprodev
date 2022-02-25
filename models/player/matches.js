const db = require ('../../lib/db')
const util = require ('../../lib/util')
const mvb = require ('../../lib/mvb')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {

		let gamemode = (req.params.gamemode) ? req.params.gamemode : 'ctf'
		if(gamemode != 'ctf' && gamemode != 'nf')
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
	let raw = await db.select(`
		SELECT
			COALESCE(team.acronym, 'SUB') as acronym,
			COALESCE(team.color, '#404040') as color,
			euid,
			CASE
				WHEN result_half_win = 1 THEN 'w'
				WHEN result_half_lose = 1 THEN 'l'
				ELSE 't'
			END as result,
			${select}

		FROM playergame
		LEFT JOIN game ON playergame.gameid = game.id
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN season ON game.seasonid = season.id

		LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid AND seasonplayer.seasonteamid IN (SELECT id FROM seasonteam WHERE seasonid = game.seasonid)
		LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
		LEFT JOIN team ON seasonteam.teamid = team.id
		WHERE playergame.playerid = $1 AND season.mode = $2
		ORDER BY game.datetime DESC
	`, [playerid, gamemode], 'all')

	return raw
}

async function getSelect(gamemode) {
	let raw
	let mvb_select = mvb.getSelectSingle(gamemode)
	switch(gamemode) {
		case 'ctf':
			raw = `
				${mvb_select} as mvb,
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
			raw = `
				${mvb_select} as mvb,
				cap as caps,
				assist as assists,
				ROUND((
					hold / (
						hold_team_for::DECIMAL + hold_team_against::DECIMAL
					)
				) * 100, 0) || '%' as poss,
				tag as tags,
				takeover as takeovers,
				grab as grabs,
				TO_CHAR(hold * interval '1 sec', 'hh24:mi:ss') as hold,
				chain as chains,
				TO_CHAR(prevent * interval '1 sec', 'hh24:mi:ss') as prevent,
				TO_CHAR(block * interval '1 sec', 'hh24:mi:ss') as block,
				pup_jj + pup_rb + pup_tp as pups
			`
			break;
	}
	return raw
}
