const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		const user = req.params.userId
		const userid = await playerExists(user)
		const elo = (req.query.elo) ? req.query.elo : 2000

		const calc = (original, max) => {
			let diff = max - original
			let per_diff = 100 - ((diff/max) * 100)
			let v = (per_diff / 100) * 20

			if(v > 20)
				v = 20

			// return v.toFixed(2)
			return Math.round(v.toFixed(2))
		}

		const calc_win = (current, max) => {
			let min = 35

			if(current < min)
				current = min

			let diff = max - min
			// console.log('diff between max and min: ' + diff)

			let diff_from_max_to_current = current - min
			// console.log('diff between max and current: ' + diff_from_max_to_current)

			let percent = diff_from_max_to_current / diff
			// console.log('percentage diff: ' + percent)

			let value = 20 * percent
			// console.log(percent.toFixed(2) + '% of 20: ' + value.toFixed(2))

			// console.log('value: ' + value)

			if(value > 20)
				value = 20

			return Math.round(value)
		}

		let data = {
			title: `${user}'s seasons`,
			user: user,
			navtab: 'seasons',
			nav: 'player',
			seasons: [],
		}

		let seasons = await getSeasonsPlayed(userid, elo)
		for await (const s of seasons) {
			let raw = {
				seasonid: s.seasonid,
				seasonname: 'Season ' + s.number,
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
			raw.radar.rank = calc_win(raw.real.rank, raw.max.rank)
			// raw.radar.rank = calc(raw.real.rank, raw.max.rank)

			// if(s.seasonid === 1) {
			// 	let test = calc_win(raw.real.rank, raw.max.rank)
			// }

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

async function getSeasonsPlayed(player, elo) {
	return await db.select(`
		SELECT seasonid, name, number
		FROM playergame
		LEFT JOIN game ON playergame.gameid = game.id
		LEFT JOIN season ON game.seasonid = season.id
		WHERE playerid = $1 AND elo >= $2
		GROUP BY seasonid, name, number, playerid
		HAVING count(*) > 20
		ORDER BY number DESC
	`, [player, elo], 'all')
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
}

async function getMaxRank(seasonid, elo) {
	return await db.select(`
		SELECT
			Round(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) as rank
		FROM playergame
		left join game ON game.id = playergame.gameid
		WHERE
			seasonid = $1 AND elo >= $2
		GROUP BY playerid, seasonid
		HAVING count(*) > 50
		ORDER BY rank DESC
		LIMIT 1
	`, [seasonid, elo], 'rank')
}

// async function getMaxRank(seasonid, elo) {
// 	return await db.select(`
// 		SELECT rank
// 		FROM playerskill
// 		WHERE seasonid = $1
// 		ORDER BY rank DESC
// 		LIMIT 1
// 	`, [seasonid], 'rank')
// 	return raw
// }

async function getDataReal(player, seasonid, elo) {
	let raw = await db.select(`
		SELECT
			count(*) as total,
			Round(avg(elo)) as elo,
			Round(CAST(rank as numeric), 2) as mmr,
			Round(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) || '%' as winrate,
			Round(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) as rank,
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
