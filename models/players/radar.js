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
			data: await getDataReal(userid),
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
		}

		data.value.cap = calc(data.data.cap, data.max.cap)
		data.value.pup = calc(data.data.pup, data.max.pup)
		data.value.return = calc(data.data.return, data.max.return)
		data.value.tag = calc(data.data.tag, data.max.tag)
		data.value.prevent = calc(data.data.prevent, data.max.prevent)
		data.value.hold = calc(data.data.hold, data.max.hold)
		data.value.grab = calc(data.data.grab, data.max.grab)
		data.value.rank = calc(data.data.rank, data.max.rank)
		// console.log(data)

		res.render('player-radar', data);
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

function calc(original, max) {
	let diff = max - original
	let per_diff = 100 - ((diff/max) * 100)
	let v = (per_diff / 100) * 20
	return v
}

async function playerExists(player) {
	let id = await db.select(`SELECT id from player WHERE name = $1`, [player], 'id')

	if(!id)
		throw 'cannot find player name: ' + player

	return id
}

async function getMaxCap() {
	return await db.select(`
		SELECT
			avg(cap) as cap
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		GROUP BY playerid
		HAVING count(*) > 50
		ORDER BY cap DESC
	`, false, 'cap')
	return raw
}

async function getMaxTag() {
	return await db.select(`
		SELECT
			avg(tag) as tag
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		GROUP BY playerid

		HAVING count(*) > 50

		ORDER BY tag DESC
	`, false, 'tag')
	return raw
}

async function getMaxReturn() {
	return await db.select(`
		SELECT
			avg(return) as return
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		GROUP BY playerid

		HAVING count(*) > 50

		ORDER BY return DESC
	`, false, 'return')
	return raw
}

async function getMaxHold() {
	return await db.select(`
		SELECT
			avg(hold) as hold
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		GROUP BY playerid

		HAVING count(*) > 50
		ORDER BY hold DESC
	`, false, 'hold')
	return raw
}

async function getMaxPrevent() {
	return await db.select(`
		SELECT
			avg(prevent) as prevent
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		GROUP BY playerid

		HAVING count(*) > 50
		ORDER BY prevent DESC
	`, false, 'prevent')
	return raw
}

async function getMaxPup() {
	return await db.select(`
		SELECT
			avg(pup_tp)+avg(pup_rb)+avg(pup_jj) as pup
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		GROUP BY playerid
		HAVING count(*) > 50
		ORDER BY pup DESC
	`, false, 'pup')
	return raw
}

async function getMaxGrab() {
	return await db.select(`
		SELECT
			avg(grab) as grab
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			elo >= 2000
		GROUP BY playerid
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

async function getDataReal(player) {
	let raw = await db.select(`
		SELECT
			avg(cap) as cap,
			avg(return) as return,
			avg(tag) as tag,
			avg(prevent) as prevent,
			avg(hold) as hold,
			avg(pup_tp)+avg(pup_rb)+avg(pup_jj) as pup,
			avg(grab) as grab,
			rank

		from playergame
		left join game ON game.id = playergame.gameid
		left join playerskill ON playerskill.playerid = playergame.playerid
		where
			playergame.playerid = $1
			AND elo >= 2000
			-- AND date > now() - interval '2 week'
		GROUP BY playerskill.rank
	`, [player], 'row')

	return raw
}

async function getData(player) {
	let raw = await db.select(`
		SELECT
			ROUND(
				(
					sum(cap)::FLOAT
					/
					sum(cap_team_for)::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as cap,

			ROUND(
				(
					sum(return)::FLOAT
					/
					sum(return_team_for)::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as returns,

			ROUND(
				(
					sum(prevent)::FLOAT
					/
					sum(prevent_team_for)::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as prevent,

			ROUND(
				(
					sum(hold)::FLOAT
					/
					sum(hold_team_for)::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as hold,

			ROUND(
				(
					(sum(pup_tp)+sum(pup_rb)+sum(pup_jj))::FLOAT
					/
					(sum(pup_tp_team_for)+sum(pup_rb_team_for)+sum(pup_jj_team_for))::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as pup

		from playergame
		left join game ON game.id = playergame.gameid
		where
			playerid = $1
			AND elo >= 2000
			-- AND date > now() - interval '2 week'
	`, [player], 'row')

	return raw
}
