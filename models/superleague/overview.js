const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {

		let data = {
			title: 'Overview',
			nav: {
				primary: 'superleague',
				secondary: 'overview',
			},

			date: await getSeasonDate(5),
			teams: await getTeamCount(5),
			players: await getPlayerCount(5),
			mvb: await getMVB(5),
			maps: await getMaps(5),
		}
		res.render('superleague-overview', data);
		// res.json(data)
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
		WHERE seasonid = $1
	`, [seasonid], 'total')

	return raw
}

async function getPlayerCount(seasonid) {
	let raw = await db.select(`
		SELECT count(*) as total
		FROM seasonplayer
		LEFT JOIN seasonteam ON seasonplayer.seasonteamid = seasonteam.id
		WHERE seasonid = $1
	`, [seasonid], 'total')

	return raw
}

async function getMVB(seasonid) {
	let raw = await db.select(`
		select
			RANK() OVER (
				ORDER BY
					ROUND(
						(avg(cap) * 100) +
						(avg(assist) * 50) +
						(avg(takeover_good) * 20)+
						(avg(tag)*5) +
						(avg(pup_jj) + avg(pup_rb)) * 10 +
						((avg(hold) / avg(grab) * 5)) +
						(avg(chain) * 10) +
						(avg(prevent) / 3) +
						avg(kept_flag)
					, 0) DESC
			) rank,
			player.name as player,
			COALESCE(team.acronym, 'SUB') as acronym,
			COALESCE(team.color, '#404040') as color,

			ROUND(
				(avg(cap) * 100)  +
				(avg(assist) * 50) +
				(avg(takeover_good) * 20)+
				(avg(tag)*5) +
				(avg(pup_jj) + avg(pup_rb)) * 10 +
				((avg(hold) / avg(grab) * 5)) +
				(avg(chain) * 10) +
				(avg(prevent) / 3) +
				avg(kept_flag)
			, 0) as value

		from playergame
		left join player on player.id = playergame.playerid
		LEFT JOIN game ON game.id = playergame.gameid
		LEFT JOIN seasonschedule ON game.id = seasonschedule.gameid

		LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
		LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
		LEFT JOIN team ON seasonteam.teamid = team.id


		where seasonschedule.seasonid = $1
		and league = true
		group by player.name, team.acronym, team.color

		having sum(play_time) > 8000
		--having sum(play_time) > 2000
		order by value DESC
		limit 10
	`, [seasonid], 'all')
	return raw
}

async function getMaps(seasonid) {
	let raw = await db.select(`
		select
			RANK() OVER (
				ORDER BY
					map DESC
			) rank,

			map.name as mpa,

			ROUND(
				(avg(cap) * 100)  +
				(avg(assist) * 50) +
				(avg(takeover_good) * 20)+
				(avg(tag)*5) +
				(avg(pup_jj) + avg(pup_rb)) * 10 +
				((avg(hold) / avg(grab) * 5)) +
				(avg(chain) * 10) +
				(avg(prevent) / 3) +
				avg(kept_flag)
			, 0) as value

		FROM playerschedule
		LEFT JOIN game on game.id = playerschedule.gameid
		LEFT JOIN playergame ON game.id = playergame.gameid
		left join map on map.id = playergame.mapid

		where seasonschedule.seasonid = $1
		group by map.name

		order by value DESC
		limit 10
	`, [seasonid], 'all')
	return raw
}
