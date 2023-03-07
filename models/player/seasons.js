const db = require ('../../lib/db')
const util = require ('../../lib/util')
const mvb = require ('../../lib/mvb')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	const calc = (original, max) => {
		let diff = max - original
		let per_diff = 100 - ((diff/max) * 100)
		let v = (per_diff / 100) * 20

		if(v > 20)
			v = 20

		return Math.round(v.toFixed(2))
	}

	const calc_win = (current, max, min) => {
		if(current < min)
			current = min

		let diff = max - min

		let diff_from_max_to_current = current - min

		let percent = diff_from_max_to_current / diff

		let value = 20 * percent

		if(value > 20)
			value = 20

		return Math.round(value)
	}

	try {
		let data = {
			config: {
				title: req.player.name + ' seasons',
				player: req.player.name,
				path: req.baseUrl,
				nav: {
					cat: 'players',
					page: 'seasons',
				}
			},
			seasons: [],
		}

		let seasons = await getSeasonsPlayed(req.player.id)

		for await (const s of seasons) {
			let raw = {
				seasonid: s.seasonid,
				seasonname: s.mode.toUpperCase() + ' Season ' + s.number,
				gamemode: s.mode,
				team: await getTeam(req.player.id, s.seasonid),
				real: await getDataReal(req.player.id, s.seasonid, s.mode),
				avg: await getDataRealAvg(req.player.id, s.seasonid, s.mode),
				max: {
					cap: await getMaxCap(s.seasonid),
					assist: await getMaxAssist(s.seasonid),
					return: await getMaxReturn(s.seasonid),
					tag: await getMaxTag(s.seasonid),
					hold: await getMaxHold(s.seasonid),
					prevent: await getMaxPrevent(s.seasonid),

					pup: await getMaxPup(s.seasonid),
					mvb: await getMaxMVB(s.seasonid, s.mode),

					takeover: await getMaxTakeover(s.seasonid),
					grab: await getMaxGrab(s.seasonid),
				},
				radar: {},
				radaravg: {}
			}

			raw.radar.cap = calc(raw.real.cap, raw.max.cap)
			raw.radar.assist = calc(raw.real.assist, raw.max.assist)
			raw.radar.pup = calc(raw.real.pup, raw.max.pup)
			raw.radar.return = calc(raw.real.return, raw.max.return)
			raw.radar.tag = calc_win(raw.real.tag, raw.max.tag, 0)
			raw.radar.prevent = calc_win(raw.real.prevent, raw.max.prevent, 0)
			raw.radar.hold = calc(raw.real.hold, raw.max.hold)
			raw.radar.mvb = calc(raw.real.mvb, raw.max.mvb)
			//
			raw.radar.takeover = calc(raw.real.takeover, raw.max.takeover)
			raw.radar.grab = calc(raw.real.grab, raw.max.grab)

			raw.radaravg.cap = calc(raw.avg.cap, raw.max.cap)
			raw.radaravg.assist = calc(raw.avg.assist, raw.max.assist)
			raw.radaravg.pup = calc(raw.avg.pup, raw.max.pup)
			raw.radaravg.return = calc(raw.avg.return, raw.max.return)
			raw.radaravg.tag = calc_win(raw.avg.tag, raw.max.tag, 0)
			raw.radaravg.prevent = calc_win(raw.avg.prevent, raw.max.prevent, 0)
			raw.radaravg.hold = calc(raw.avg.hold, raw.max.hold)
			raw.radaravg.mvb = calc(raw.avg.mvb, raw.max.mvb)
			//
			raw.radaravg.takeover = calc(raw.avg.takeover, raw.max.takeover)
			raw.radaravg.grab = calc(raw.avg.grab, raw.max.grab)

			data.seasons.push(raw)
		}

		res.render('player-seasons', data)
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function getSeasonsPlayed(player) {
	return await db.select(`
		SELECT
			seasonid, mode, number
		FROM playergame
		LEFT JOIN game ON playergame.gameid = game.id
		LEFT JOIN season ON game.seasonid = season.id
		WHERE playerid = $1
		GROUP BY seasonid, mode, number
		HAVING count(*) > 10
		ORDER BY seasonid DESC
	`, [player], 'all')
}

async function getMaxCap(seasonid) {
	return await db.select(`
		SELECT
			avg(cap) as cap
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY cap DESC
	`, [seasonid], 'cap')
}

async function getMaxAssist(seasonid) {
	return await db.select(`
		SELECT
			avg(assist) as assist
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY assist DESC
	`, [seasonid], 'assist')
}

async function getMaxReturn(seasonid) {
	return await db.select(`
		SELECT
			avg(return) as return
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY return DESC
	`, [seasonid], 'return')
}

async function getMaxTag(seasonid) {
	return await db.select(`
		SELECT
			avg(tag) as tag
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY tag DESC
	`, [seasonid], 'tag')
}


async function getMaxHold(seasonid) {
	return await db.select(`
		SELECT
			avg(hold) as hold
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY hold DESC
	`, [seasonid], 'hold')
}

async function getMaxPrevent(seasonid) {
	return await db.select(`
		SELECT
			avg(prevent) as prevent
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY prevent DESC
	`, [seasonid], 'prevent')
}

async function getMaxPup(seasonid) {
	return await db.select(`
		SELECT
			avg(pup_tp + pup_rb + pup_jj) as pup
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY pup DESC
	`, [seasonid], 'pup')
}

async function getMaxTakeover(seasonid) {
	return await db.select(`
		SELECT
			avg(takeover) as takeover
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY takeover DESC
	`, [seasonid], 'takeover')
}

async function getMaxGrab(seasonid) {
	return await db.select(`
		SELECT
			avg(grab) as grab
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY grab DESC
	`, [seasonid], 'grab')
}

async function getMaxMVB(seasonid, gamemode) {
	let mvb_select = mvb.getSelect(gamemode)
	return await db.select(`
		SELECT
			${mvb_select} / count(*) as mvb
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE seasonid = $1 AND seasonschedule.league = TRUE
		GROUP BY playerid, seasonid
		HAVING count(*) > 7
		ORDER BY mvb DESC
		LIMIT 1
	`, [seasonid], 'mvb')
}

async function getDataReal(player, seasonid, gamemode) {
	let mvb_select = mvb.getSelect(gamemode)

	let raw = await db.select(`
		SELECT
			avg(pup_tp + pup_rb + pup_jj) as pup,
			avg(assist) as assist,
			avg(cap) as cap,
			avg(hold) as hold,
			avg(prevent) as prevent,
			avg(return) as return,
			avg(tag) as tag,
			avg(takeover) as takeover,
			avg(grab) as grab,
			${mvb_select} / count(*) as mvb
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE playerid = $1 AND seasonid = $2 AND seasonschedule.league = TRUE
	`, [player, seasonid], 'row')
	return raw
}

async function getDataRealAvg(player, seasonid, gamemode) {
	let mvb_select = mvb.getSelect(gamemode)

	let raw = await db.select(`
		SELECT
			avg(pup_tp + pup_rb + pup_jj) as pup,
			avg(assist) as assist,
			avg(cap) as cap,
			avg(hold) as hold,
			avg(prevent) as prevent,
			avg(return) as return,
			avg(tag) as tag,
			avg(takeover) as takeover,
			avg(grab) as grab,
			${mvb_select} / count(*) as mvb
		FROM playergame
		left join seasonschedule ON seasonschedule.gameid = playergame.gameid
		WHERE playerid != $1 AND seasonid = $2 AND seasonschedule.league = TRUE
	`, [player, seasonid], 'row')
	return raw
}

async function getTeam(player, seasonid) {
	let raw = await db.select(`
        SELECT
            t.id,
            t.name,
            t.acronym,
            t.logo,
            t.color,
            st.id,
			st.winner,
			st.runnerup,

            ARRAY(
				select json_build_object('name', name, 'country', LOWER(country), 'captain', seasonplayer.captain)
                from player
                left join seasonplayer on seasonplayer.playerid = player.id
                left join seasonteam on seasonplayer.seasonteamid = seasonteam.id
                where seasonteam.id = st.id
                ORDER BY captain DESC, st.id DESC
            ) AS players

        FROM seasonplayer as sp
        LEFT JOIN seasonteam as st on st.id = sp.seasonteamid
        LEFT JOIN team as t on t.id = st.teamid
        WHERE st.seasonid = $2 AND sp.playerid = $1
        GROUP BY t.id, t.name, t.acronym, t.logo, t.color, st.id, st.winner, st.runnerup
        ORDER BY t.name ASC
	`, [player, seasonid], 'row')

	return raw
}
