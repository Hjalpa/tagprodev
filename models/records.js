const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		// default to all seasons
		let filters =  {
			where: 'WHERE ELO >= 2000 AND duration >= 360'
		}
		let title = 'All-Time Records'

		if(req.query.season) {
			// season 2
			if(req.query.season === '2') {
				filters =  {
					where: 'WHERE ELO >= 2000 AND duration >= 420 AND seasonid = 1'
				}
				title = 'Season 2 Records'
			}
			// season 1
			else if(req.query.season === '1') {
				filters =  {
					where: 'WHERE ELO >= 2000 AND duration >= 420 AND seasonid = 2'
				}
				title = 'Season 1 Records'
			}
			else
				throw 'invalid season'
		}

		let data = {
			title,
			season: (req.query.season) ? req.query.season : false,
			nav: 'records',
			mostcaps: await mostCaps(filters),
			mostpups: await mostPups(filters),
			mosttagpros: await mostTagpros(filters),

			mostreturns: await mostReturns(filters),
			mostquickreturns: await mostQuickReturns(filters),
			mostkeyreturns: await mostKeyReturns(filters),

			mosttags: await mostTags(filters),
			mostgrabs: await mostGrabs(filters),
			mostprevent: await mostPrevent(filters),
			mosthold: await mostHold(filters),
		}
		res.render('records', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
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
