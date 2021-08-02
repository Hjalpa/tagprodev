const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let user = req.params.userId
		let userid = await playerExists(user)

		let data = {
			title: `${user}`,
			user: user,
			navtab: 'summary',
			nav: 'player',
			// radar
			data: await getDataReal(userid, 2),
			// dataSeason2: await getDataReal(userid, 1),
			// dataSeason3: await getDataReal(userid, 3),
			max: {
				cap: await getMaxCap(),
				return: await getMaxReturn(),
				tag: await getMaxTag(),
				hold: await getMaxHold(),
				prevent: await getMaxPrevent(),
				pup: await getMaxPup(),
				grab: await getMaxGrab(),
				rank: await getMaxRank(),
			},
			value: {}
			// value2: {},
			// value3: {}
		}

		data.value.cap = calc(data.data.cap, data.max.cap)
		data.value.pup = calc(data.data.pup, data.max.pup)
		data.value.return = calc(data.data.return, data.max.return)
		data.value.tag = calc(data.data.tag, data.max.tag)
		data.value.prevent = calc(data.data.prevent, data.max.prevent)
		data.value.hold = calc(data.data.hold, data.max.hold)
		data.value.grab = calc(data.data.grab, data.max.grab)
		data.value.rank = calc(data.data.rank, data.max.rank)

		// data.value2.cap = calc(data.dataSeason2.cap, data.max.cap)
		// data.value2.pup = calc(data.dataSeason2.pup, data.max.pup)
		// data.value2.return = calc(data.dataSeason2.return, data.max.return)
		// data.value2.tag = calc(data.dataSeason2.tag, data.max.tag)
		// data.value2.prevent = calc(data.dataSeason2.prevent, data.max.prevent)
		// data.value2.hold = calc(data.dataSeason2.hold, data.max.hold)
		// data.value2.grab = calc(data.dataSeason2.grab, data.max.grab)
		// data.value2.rank = calc(data.dataSeason2.rank, data.max.rank)

		// data.value3.cap = calc(data.dataSeason3.cap, data.max.cap)
		// data.value3.pup = calc(data.dataSeason3.pup, data.max.pup)
		// data.value3.return = calc(data.dataSeason3.return, data.max.return)
		// data.value3.tag = calc(data.dataSeason3.tag, data.max.tag)
		// data.value3.prevent = calc(data.dataSeason3.prevent, data.max.prevent)
		// data.value3.hold = calc(data.dataSeason3.hold, data.max.hold)
		// data.value3.grab = calc(data.dataSeason3.grab, data.max.grab)
		// data.value3.rank = calc(data.dataSeason3.rank, data.max.rank)

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

function calc(original, max) {
	let diff = max - original
	let per_diff = 100 - ((diff/max) * 100)
	let v = (per_diff / 100) * 20
	return v
}

async function getMaxCap() {
	return await db.select(`
		SELECT
			-- avg(cap) as cap
			ROUND(sum(cap) / (sum(play_time) / 60)::numeric, 2) * 8 as cap
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		-- 	seasonid = 3
		--	date > now() - interval '6 month'
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY cap DESC
	`, false, 'cap')
	return raw
}

async function getMaxTag() {
	return await db.select(`
		SELECT
			-- avg(tag) as tag
			ROUND(sum(tag) / (sum(play_time) / 60)::numeric, 2) * 8 as tag
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		--	seasonid = 3
		--	date > now() - interval '6 month'
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY tag DESC
	`, false, 'tag')
	return raw
}

async function getMaxReturn() {
	return await db.select(`
		SELECT
			-- avg(return) as return
			ROUND(sum(return) / (sum(play_time) / 60)::numeric, 2) * 8 as return
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		--	seasonid = 3
		--	date > now() - interval '6 month'
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY return DESC
	`, false, 'return')
	return raw
}

async function getMaxHold() {
	return await db.select(`
		SELECT
			-- avg(hold) as hold
			ROUND(sum(hold) / (sum(play_time) / 60)::numeric, 2) * 8 as hold
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		--	seasonid = 3
		--	date > now() - interval '6 month'
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY hold DESC
	`, false, 'hold')
	return raw
}

async function getMaxPrevent() {
	return await db.select(`
		SELECT
			-- avg(prevent) as prevent
			ROUND(sum(prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as prevent
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		-- 	seasonid = 3
		--	date > now() - interval '6 month'
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY prevent DESC
	`, false, 'prevent')
	return raw
}

async function getMaxPup() {
	return await db.select(`
		SELECT
			-- avg(pup_tp)+avg(pup_rb)+avg(pup_jj) as pup
			ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) * 8 as pup
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		--	seasonid = 3
		--	date > now() - interval '6 month'
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY pup DESC
	`, false, 'pup')
	return raw
}

async function getMaxGrab() {
	return await db.select(`
		SELECT
			-- avg(grab) as grab
			ROUND(sum(grab) / (sum(play_time) / 60)::numeric, 2) * 8 as grab
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		--	seasonid = 3
		--	date > now() - interval '6 month'
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY grab DESC
	`, false, 'grab')
	return raw
}

async function getMaxRank() {
	return await db.select(`
		SELECT
			rank
		FROM playerskill
		ORDER BY rank DESC
		LIMIT 1
	`, false, 'rank')
	return raw
}

async function getDataReal(player, seasonid) {
	let raw = await db.select(`
		SELECT
			-- avg(cap) as cap,
			-- avg(return) as return,
			-- avg(tag) as tag,
			-- avg(prevent) as prevent,
			-- avg(hold) as hold,
			-- avg(grab) as grab,
			-- avg(pup_tp)+avg(pup_rb)+avg(pup_jj) as pup,

			ROUND(sum(cap) / (sum(play_time) / 60)::numeric, 2) * 8 as cap,
			ROUND(sum(return) / (sum(play_time) / 60)::numeric, 2) * 8 as return,
			ROUND(sum(tag) / (sum(play_time) / 60)::numeric, 2) * 8 as tag,
			ROUND(sum(prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as prevent,
			ROUND(sum(hold) / (sum(play_time) / 60)::numeric, 2) * 8 as hold,
			ROUND(sum(grab) / (sum(play_time) / 60)::numeric, 2) * 8 as grab,
			ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) * 8 as pup,
			rank

		FROM playergame
		LEFT JOIN game ON game.id = playergame.gameid
		LEFT JOIN playerskill ON playerskill.playerid = playergame.playerid
		WHERE
			playergame.playerid = $1
			AND seasonid = $2
			-- AND elo >= 2000
			-- AND date > now() - interval '6 month'
		GROUP BY playerskill.rank
	`, [player, seasonid], 'row')

	return raw
}
