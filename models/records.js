const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		// default to all seasons
		let filters =  {
			where: 'WHERE duration >= 60',
			where_streak: 'WHERE duration >= 10'
		}
		let title = 'All-Time Records'

		if(req.query.season) {
			// season 2
			if(req.query.season === '2') {
				filters.where = filters.where + ' AND seasonid = 1'
				filters.where_streak = filters.where_streak + ' AND seasonid = 1'
				title = 'Season 2 Records'
			}
			// season 1
			else if(req.query.season === '1') {
				filters.where = filters.where + ' AND seasonid = 2'
				filters.where_streak = filters.where_streak + ' AND seasonid = 2'
				title = 'Season 1 Records'
			}
			else
				throw 'invalid season'
		}

		if(req.query.elo) {
			if(req.query.elo === 'low') {
				filters.where = filters.where + ' AND ELO < 2000'
				filters.where_streak = filters.where_streak + ' AND ELO < 2000'
				title = title + ' -  Low ELO'
			}
			else
				throw 'invalid elo'
		}
		else {
			filters.where = filters.where + ' AND ELO >= 2000'
			filters.where_streak = filters.where_streak + ' AND ELO >= 2000'
		}


		let data = {
			title,
			season: (req.query.season) ? req.query.season : false,
			elo: (req.query.elo) ? req.query.elo: false,
			nav: 'records',

			mostpups: await mostPups(filters),
			mosttagpros: await mostTagpros(filters),
			winstreak: await winStreak(filters),

			mostcaps: await mostCaps(filters),
			mostgrabs: await mostGrabs(filters),
			mosthold: await mostHold(filters),
			mosttags: await mostTags(filters),

			mostprevent: await mostPrevent(filters),
			mostreturns: await mostReturns(filters),
			mostquickreturns: await mostQuickReturns(filters),
			mostkeyreturns: await mostKeyReturns(filters),

		}
		res.render('records', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function winStreak(filters) {
	let raw = await db.select(`
		SELECT
			rank() OVER (ORDER BY MAX(cnt) DESC) as rank,
			player.name as player,
			MAX(cnt) as streak
		FROM
			(
			SELECT
				playerid,
				COUNT(*) AS cnt
			FROM
				(
				SELECT
					playerid,
					gameid,
					result_half_win,
					SUM(CASE WHEN result_half_win <> '1' THEN 1 END)
					OVER (PARTITION BY playerid
						ORDER BY euid
						ROWS UNBOUNDED PRECEDING) AS dummy
				FROM playergame
				LEFT JOIN game ON playergame.gameid = game.id
				) dt
				LEFT JOIN game ON dt.gameid = game.id
			${filters.where_streak} AND result_half_win = '1'
			GROUP BY playerid, dummy
			) dt
		LEFT JOIN player ON dt.playerid = player.id
		GROUP BY playerid, player.name
		ORDER BY streak DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostCaps(filters) {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY ROUND(play_time::NUMERIC / cap, 2) ASC
			) rank,
			player.name as player,
			TO_CHAR(
				ROUND(play_time::NUMERIC / cap, 2) * interval '1 sec'
			, 'MI:SS') as cap,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND cap > 0
 		ORDER BY cap ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostPups(filters) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY play_time / (pup_jj+pup_rb+pup_tp) ASC
			) rank,
			player.name as player,
			TO_CHAR(
				ROUND(play_time::NUMERIC / (pup_jj + pup_rb + pup_tp)::NUMERIC, 2) * interval '1 sec',
			'MI:SS') as pup,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND (pup_jj+pup_rb+pup_tp) > 0
		ORDER BY pup ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostTagpros(filters) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY play_time / pup_tp ASC
			) rank,
			player.name as player,
			TO_CHAR(
				ROUND(play_time::NUMERIC / pup_tp::NUMERIC, 2) * interval '1 sec',
			'MI:SS') as pup,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND pup_tp > 0
		ORDER BY pup ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostReturns(filters) {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY ROUND(play_time::NUMERIC / NULLIF(return, 0), 2) ASC
			) rank,
			player.name as player,
			ROUND(play_time::NUMERIC / NULLIF(return, 0), 2) as returns,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND return > 0
		ORDER BY returns ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostQuickReturns(filters) {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY play_time /quick_return::NUMERIC ASC
			) rank,
			player.name as player,
			ROUND(play_time / quick_return::NUMERIC, 2) as quickreturns,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND quick_return > 0
		ORDER BY quickreturns ASC
		LIMIT 10
	`, [], 'all')
	return raw
}

async function mostKeyReturns(filters) {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY play_time::NUMERIC / key_return::NUMERIC ASC
			) rank,
			player.name as player,
			TO_CHAR(
				ROUND(play_time::NUMERIC / key_return::NUMERIC, 2) * interval '1 sec'
			, 'MI:SS') as keyreturns,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND key_return > 0
		ORDER BY keyreturns ASC
		LIMIT 10
	`, [], 'all')
	return raw
}

async function mostTags(filters) {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY ROUND(play_time::NUMERIC / tag, 2) ASC
			) rank,
			player.name as player,
			ROUND(play_time::NUMERIC / tag, 2) as tag,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND tag > 0
		ORDER BY tag ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostPrevent(filters) {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY prevent / (play_time::numeric / 60) DESC
			) rank,
			player.name as player,
			ROUND(prevent / (play_time::numeric / 60), 2) as prevent,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND prevent > 0
		ORDER BY prevent DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostGrabs(filters) {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY ROUND(play_time::NUMERIC / grab::NUMERIC, 2) ASC
			) rank,
			player.name as player,
			ROUND(play_time::NUMERIC / grab::NUMERIC, 2) as grab,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND grab > 0
		ORDER BY grab ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostHold(filters) {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY hold / (play_time::numeric / 60) DESC
			) rank,
			player.name as player,
			ROUND(hold / (play_time::numeric / 60), 2) as hold,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		${filters.where} AND hold > 0
		ORDER BY hold DESC
		LIMIT 10
	`, [], 'all')

	return raw
}
