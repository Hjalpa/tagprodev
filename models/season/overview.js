const db = require ('../../lib/db')
const util = require ('../../lib/util')
const mvb = require ('../../lib/mvb')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let tier = req.seasonTier ? ` ${req.seasonTier}` : ''
		let data = {
			config: {
				title: req.mode.toUpperCase() + tier + ' Season ' + req.season,
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				tier: req.seasonTier,
				nav: {
					cat: req.mode,
					page: 'overview'
				}
			},
			date: await getSeasonDate(req.seasonid),
			teams: await getTeamCount(req.seasonid),
			players: await getPlayerCount(req.seasonid),
			mvb: await getMVB(req.mode, req.seasonid),
			champions: await getChampions(req.seasonid),
			leaguewinner: await getLeagueWinner(req.seasonid),
			playofffinalstream: await getPlayoffFinalStream(req.seasonid),
		}
		res.render('superleague-overview', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getSeasonDate(seasonid) {
	let raw = await db.select(`
		SELECT

			TO_CHAR(MIN(date), 'Mon DD') as start,
			TO_CHAR(MAX(date), 'Mon DD, YYYY') as end

		FROM seasonschedule
		WHERE SeasonID = $1
		GROUP BY seasonschedule.seasonid
		LIMIT 1
	`, [seasonid], 'row')
	return raw
}

async function getTeamCount(seasonid) {
	let raw = await db.select(`
		SELECT count(*) as total FROM seasonteam WHERE seasonid = $1
	`, [seasonid], 'total')

	return raw
}

async function getPlayerCount(seasonid) {
	let raw = await db.select(`
		SELECT count(*) as total
		FROM seasonplayer
		LEFT JOIN seasonteam ON seasonplayer.seasonteamid = seasonteam.id
		WHERE seasonteam.seasonid = $1
	`, [seasonid], 'total')

	return raw
}

async function getPlayoffFinalStream(seasonid) {
	let raw = await db.select(`
		SELECT finalstream
		FROM season
		WHERE id = $1
	`, [seasonid], 'finalstream')

	return raw
}

async function getMVB(gamemode, seasonid) {
	let select = mvb.getSelect(gamemode)
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY ${select} DESC
			) rank,
			player.name as player,
			COALESCE(team.acronym, 'SUB') as acronym,
			COALESCE(team.color, '#404040') as color,
			${select} as value

		FROM playergame
		LEFT JOIN game ON game.id = playergame.gameid AND game.seasonid = $1
		LEFT JOIN seasonschedule ON game.id = seasonschedule.gameid
		LEFT JOIN player ON player.id = playergame.playerid

		LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid AND seasonplayer.seasonteamid IN (SELECT id FROM seasonteam WHERE seasonid = $1)
		LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
		LEFT JOIN team ON seasonteam.teamid = team.id

		WHERE seasonteam.seasonid = $1 AND league = true AND game.seasonid = $1
		GROUP BY player.name, team.acronym, team.color

		HAVING sum(play_time) > 10
		ORDER BY value DESC
		LIMIT 6
	`, [seasonid], 'all')
	return raw
}

async function getChampions(seasonid) {
	let raw = await db.select(`
		SELECT
            t.id,
            t.name,
            t.acronym,
            t.logo,
            t.color,
            st.id,
			st.winner,

            ARRAY(
				select json_build_object('name', name, 'country', LOWER(country), 'captain', seasonplayer.captain, 'manager', seasonplayer.manager)
                from player
                left join seasonplayer on seasonplayer.playerid = player.id
                left join seasonteam on seasonplayer.seasonteamid = seasonteam.id
                where seasonteam.id = st.id
                ORDER BY captain DESC, cost DESC
            ) AS players

        FROM seasonplayer as sp
        LEFT JOIN seasonteam as st on st.id = sp.seasonteamid
        LEFT JOIN team as t on t.id = st.teamid
        WHERE st.seasonid = $1 AND st.winner = true
        GROUP BY t.id, t.name, t.acronym, t.logo, t.color, st.id, st.winner
        ORDER BY st.winner, t.name ASC
	`, [seasonid], 'row')

	return raw
}

async function getLeagueWinner(seasonid) {
	let raw = await db.select(`
		SELECT
            t.id,
            t.name,
            t.acronym,
            t.logo,
            t.color,
            st.id,
			st.leaguewinner,

            ARRAY(
				select json_build_object('name', name, 'country', LOWER(country), 'captain', seasonplayer.captain)
                from player
                left join seasonplayer on seasonplayer.playerid = player.id
                left join seasonteam on seasonplayer.seasonteamid = seasonteam.id
                where seasonteam.id = st.id
                ORDER BY captain DESC, name ASC
            ) AS players

        FROM seasonplayer as sp
        LEFT JOIN seasonteam as st on st.id = sp.seasonteamid
        LEFT JOIN team as t on t.id = st.teamid
        WHERE st.seasonid = $1 AND st.leaguewinner = true
        GROUP BY t.id, t.name, t.acronym, t.logo, t.color, st.id, st.leaguewinner
        ORDER BY st.leaguewinner, t.name ASC
	`, [seasonid], 'row')

	return raw
}
