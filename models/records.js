const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.initv2 = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		nav: 'records',
		mostcaps: await mostCaps(),
		mostpups: await mostPups(),
		mosttagpros: await mostTagpros(),

		mostreturns: await mostReturns(),
		mostquickreturns: await mostQuickReturns(),
		mostkeyreturns: await mostKeyReturns(),

		mosttags: await mostTags(),
		mostgrabs: await mostGrabs(),
		mostprevent: await mostPrevent(),
		mosthold: await mostHold(),
	}
	res.render('recordsv2', data);
}

async function mostCaps() {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY play_time / cap ASC
			) rank,
			player.name as player,
			play_time / cap as cap,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		WHERE elo >= 2000 AND cap > 1
		ORDER BY cap ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostPups() {
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
		WHERE (pup_jj+pup_rb+pup_tp) > 1 AND elo >= 2000
		ORDER BY pup ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostTagpros() {
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
		WHERE pup_tp > 1 AND elo >= 2000
		ORDER BY pup ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostReturns() {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY play_time / NULLIF(return, 0) ASC
			) rank,
			player.name as player,
			play_time / NULLIF(return, 0) as returns,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		WHERE elo >= 2000 AND return > 1
		ORDER BY returns ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostQuickReturns() {
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
		WHERE elo >= 2000 AND quick_return > 1
		ORDER BY quickreturns ASC
		LIMIT 10
	`, [], 'all')
	return raw
}

async function mostKeyReturns() {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY play_time / key_return::NUMERIC ASC
			) rank,
			player.name as player,
			ROUND(play_time / key_return::NUMERIC, 2) as keyreturns,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		WHERE elo >= 2000 AND key_return > 1
		ORDER BY keyreturns ASC
		LIMIT 10
	`, [], 'all')
	return raw
}

async function mostTags() {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY play_time / tag ASC
			) rank,
			player.name as player,
			play_time / tag as tag,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		WHERE tag > 10 AND elo >= 2000
		ORDER BY tag ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostPrevent() {
	let raw = await db.select(`
		select
			rank() OVER (
				ORDER BY     prevent / (play_time::numeric / 60) DESC
			) rank,
			player.name as player,
			ROUND(prevent / (play_time::numeric / 60), 2) as prevent,
			euid,
			TO_CHAR(date, 'DD Mon YY') as date
		FROM playergame
		LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		WHERE prevent > 1 AND elo >= 2000 AND duration >= 480
		ORDER BY prevent DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostGrabs() {
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
		WHERE grab > 1 AND elo >= 2000
		ORDER BY grab ASC
		LIMIT 10
	`, [], 'all')

	return raw
}



async function mostHold() {
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
		WHERE hold > 1 AND elo >= 2000 AND duration >= 480
		ORDER BY hold DESC
		LIMIT 10
	`, [], 'all')

	return raw
}
