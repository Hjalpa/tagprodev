const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.initv2 = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		nav: 'records',
		mostcaps: await mostCaps(),
		mostreturns: await mostReturns(),
		mosttags: await mostTags(),
		mostgrabs: await mostGrabs(),
	}
	res.render('recordsv2', data);
}

async function mostCaps() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY cap DESC
			) rank,
			player.name as player,
			cap,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY cap DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostReturns() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY return DESC
			) rank,
			player.name as player,
			return as returns,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY returns DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostTags() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY tag DESC
			) rank,
			player.name as player,
			tag,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY tag DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function mostGrabs() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY grab DESC
			) rank,
			player.name as player,
			grab,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY grab DESC
		LIMIT 10
	`, [], 'all')

	return raw
}
