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
			// star ratings
			maps: await getMaps(userid),
			godteam: await getGodlyTeammates(userid),
			shitteam: await getShitTeammates(userid),
			// radar
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

		res.render('player-dash', data);
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

async function getMaps(player) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				-- (count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) DESC


				ROUND(
					(
						count(*) filter (WHERE result_half_win = 1)
						/
						count(*)::DECIMAL
					) * 100
				, 2) DESC


			) rank,

			map.name as map,
			count(*) as played,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,
			ROUND(
				(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			, 3) as cap_diff_per_min,
			count(*) filter (WHERE result_half_win = 1) as won,
			count(*) filter (WHERE result_half_win = 0) as lost,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid
		LEFT JOIN map on map.id = game.mapid

		WHERE
			player.id = $1
		GROUP BY map.name
		HAVING count(*) >= 20
		ORDER BY winrate DESC
		LIMIT 6
	`, [player], 'all')

	return raw
}

async function getGodlyTeammates(player) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				(count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) * 100 DESC
			) rank,

			name as player,
			count(*) as played,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,
			ROUND(
				(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			, 3) as cap_diff_per_min,
			count(*) filter (WHERE result_half_win = 1) as won,
			count(*) filter (WHERE result_half_win = 0) as lost,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid

		WHERE
			playerid != $1 AND

			gameid IN (
					SELECT
						gameid
					FROM
						playergame as pg
					INNER JOIN player ON player.id = pg.playerid
					WHERE playerid = $2 AND gameid = playergame.gameid AND pg.team = playergame.team
				)

		GROUP BY name
		HAVING count(*) >= 30 AND

			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) > 50

		ORDER BY winrate DESC
		LIMIT 6
	`, [player, player], 'all')

	return raw
}

async function getShitTeammates(player) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				(count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) * 100 DESC
			) rank,

			name as player,
			count(*) as played,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,
			ROUND(
				(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			, 3) as cap_diff_per_min,
			count(*) filter (WHERE result_half_win = 1) as won,
			count(*) filter (WHERE result_half_win = 0) as lost,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) as winrate

		FROM playergame
		LEFT JOIN player on player.id = playergame.playerid
		LEFT JOIN game on game.id = playergame.gameid

		WHERE
			playerid != $1 AND

			gameid IN (
					SELECT
						gameid
					FROM
						playergame as pg
					INNER JOIN player ON player.id = pg.playerid
					WHERE playerid = $2 AND gameid = playergame.gameid AND pg.team = playergame.team
				)

		GROUP BY name
		HAVING count(*) >= 15 AND

			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) < 50



		ORDER BY winrate ASC
		LIMIT 6
	`, [player, player], 'all')

	return raw
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
		GROUP BY playerid
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
		GROUP BY playerid
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
		GROUP BY playerid
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
		GROUP BY playerid
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
		GROUP BY playerid
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
		GROUP BY playerid
		HAVING count(*) > 50
		ORDER BY pup DESC
	`, false, 'pup')
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
		GROUP BY playerid
		HAVING count(*) > 50
		ORDER BY grab DESC
	`, false, 'grab')
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

// async function getMaxRank() {
// 	let raw = await db.select(`
// 		SELECT
// 			ROUND(
// 				(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
// 			, 3) as rank
// 		FROM playergame
// 		LEFT JOIN player ON player.id = playergame.playerid
// 		LEFT JOIN game ON game.id = playergame.gameid
// 		WHERE
// 			elo >= 2000
// 		GROUP BY player.id
// 		HAVING count(*) > 100
// 		ORDER BY rank DESC
// 	`, false, 'rank')
// 	console.log(raw)
// 	return raw
// }

async function getDataReal(player) {
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
			--ROUND(
			--	(sum(cap_team_for)::DECIMAL - sum(cap_team_against)::DECIMAL)::DECIMAL / (sum(play_time) / 60)
			--, 3) as rank

		FROM playergame
		LEFT JOIN game ON game.id = playergame.gameid
		LEFT JOIN playerskill ON playerskill.playerid = playergame.playerid
		WHERE
			playergame.playerid = $1
			-- and seasonid = 3
			-- AND date > now() - interval '6 month'
			AND elo >= 2000
		GROUP BY playerskill.rank
	`, [player], 'row')

	return raw
}
