const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		const user = req.params.userId
		const userid = await playerExists(user)
		const elo = 2000

		const calc = (original, max) => {
			let diff = max - original
			let per_diff = 100 - ((diff/max) * 100)
			let v = (per_diff / 100) * 20
			return v
		}

		let data = {
			title: `${user}`,
			user: user,
			navtab: 'seasons',
			nav: 'player',
			seasons: [],
		}

		// get each season
		let seasons = await getSeasonsPlayed(userid)
		for await (const s of seasons) {
			let raw = {
				seasonid: s.seasonid,
				seasonname: s. name,
				real: await getDataReal(userid, s.seasonid, elo),
				max: {
					cap: await getMaxCap(s.seasonid, elo),
					return: await getMaxReturn(s.seasonid, elo),
					tag: await getMaxTag(s.seasonid, elo),
					hold: await getMaxHold(s.seasonid, elo),
					prevent: await getMaxPrevent(s.seasonid, elo),
					pup: await getMaxPup(s.seasonid, elo),
					grab: await getMaxGrab(s.seasonid, elo),
					rank: await getMaxRank(s.seasonid, elo),
				},
				radar: {}
			}

			raw.radar.cap = calc(raw.real.cap, raw.max.cap)
			raw.radar.pup = calc(raw.real.pup, raw.max.pup)
			raw.radar.return = calc(raw.real.return, raw.max.return)
			raw.radar.tag = calc(raw.real.tag, raw.max.tag)
			raw.radar.prevent = calc(raw.real.prevent, raw.max.prevent)
			raw.radar.hold = calc(raw.real.hold, raw.max.hold)
			raw.radar.grab = calc(raw.real.grab, raw.max.grab)
			raw.radar.rank = calc(raw.real.rank, raw.max.rank)

			data.seasons.push(raw)
		}

		res.render('player-seasons', data);
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function playerExists(player) {
	let id = await db.select(`SELECT id from player WHERE name = $1`, [player], 'id')

	if(!id)
		throw 'cannot find player name: ' + player

	return id
}

async function getSeasonsPlayed(player) {
	return await db.select(`
		SELECT seasonid, name
		FROM playergame
		LEFT JOIN game ON playergame.gameid = game.id
		LEFT JOIN season ON game.seasonid = season.id
		WHERE playerid = $1
		GROUP BY seasonid, name, number, playerid
		ORDER BY number DESC
	`, [player], 'all')
}

async function getMaxCap(seasonid, elo) {
	return await db.select(`
		SELECT
			-- avg(cap) as cap
			ROUND(sum(cap) / (sum(play_time) / 60)::numeric, 2) * 8 as cap
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			seasonid = $1 AND elo >= $2
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY cap DESC
	`, [seasonid, elo], 'cap')
	return raw
}

async function getMaxTag(seasonid, elo) {
	return await db.select(`
		SELECT
			-- avg(tag) as tag
			ROUND(sum(tag) / (sum(play_time) / 60)::numeric, 2) * 8 as tag
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			seasonid = $1 AND elo >= $2
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY tag DESC
	`, [seasonid, elo], 'tag')
	return raw
}

async function getMaxReturn(seasonid, elo) {
	return await db.select(`
		SELECT
			-- avg(return) as return
			ROUND(sum(return) / (sum(play_time) / 60)::numeric, 2) * 8 as return
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			seasonid = $1 AND elo >= $2
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY return DESC
	`, [seasonid, elo], 'return')
	return raw
}

async function getMaxHold(seasonid, elo) {
	return await db.select(`
		SELECT
			-- avg(hold) as hold
			ROUND(sum(hold) / (sum(play_time) / 60)::numeric, 2) * 8 as hold
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			seasonid = $1 AND elo >= $2
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY hold DESC
	`, [seasonid, elo], 'hold')
	return raw
}

async function getMaxPrevent(seasonid, elo) {
	return await db.select(`
		SELECT
			-- avg(prevent) as prevent
			ROUND(sum(prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as prevent
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			seasonid = $1 AND elo >= $2
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY prevent DESC
	`, [seasonid, elo], 'prevent')
	return raw
}

async function getMaxPup(seasonid, elo) {
	return await db.select(`
		SELECT
			-- avg(pup_tp)+avg(pup_rb)+avg(pup_jj) as pup
			ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) * 8 as pup
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			seasonid = $1 AND elo >= $2
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY pup DESC
	`, [seasonid, elo], 'pup')
	return raw
}

async function getMaxGrab(seasonid, elo) {
	return await db.select(`
		SELECT
			-- avg(grab) as grab
			ROUND(sum(grab) / (sum(play_time) / 60)::numeric, 2) * 8 as grab
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			seasonid = $1 AND elo >= $2
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY grab DESC
	`, [seasonid, elo], 'grab')
	return raw
}

async function getMaxRank(seasonid, elo) {
	return await db.select(`
		SELECT rank
		FROM playerskill
		WHERE seasonid = $1
		ORDER BY rank DESC
		LIMIT 1
	`, [seasonid], 'rank')
	return raw
}

async function getDataReal(player, seasonid, elo) {
	let raw = await db.select(`
		SELECT
			rank,
			-- avg(cap) as cap,
			-- avg(return) as return,
			-- avg(tag) as tag,
			-- avg(prevent) as prevent,
			-- avg(hold) as hold,
			-- avg(grab) as grab,
			-- avg(pup_tp)+avg(pup_rb)+avg(pup_jj) as pup
			ROUND(sum(cap) / (sum(play_time) / 60)::numeric, 2) * 8 as cap,
			ROUND(sum(return) / (sum(play_time) / 60)::numeric, 2) * 8 as return,
			ROUND(sum(tag) / (sum(play_time) / 60)::numeric, 2) * 8 as tag,
			ROUND(sum(prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as prevent,
			ROUND(sum(hold) / (sum(play_time) / 60)::numeric, 2) * 8 as hold,
			ROUND(sum(grab) / (sum(play_time) / 60)::numeric, 2) * 8 as grab,
			ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) * 8 as pup
		FROM playergame
		LEFT JOIN game ON game.id = playergame.gameid
		LEFT JOIN playerskill ON playerskill.playerid = playergame.playerid AND playerskill.seasonid = game.seasonid
		WHERE
			playergame.playerid = $1
			AND game.seasonid = $2
			AND elo >= $3
		GROUP BY playerskill.rank
	`, [player, seasonid, elo], 'row')
	return raw
}
