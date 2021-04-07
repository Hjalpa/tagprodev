const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		tab: 'records',
		longestgame: await longestGame(),
		shortestgame: await shortestGame(),
		highestelogame: await highestEloGame(),
		lowestelogame: await lowestEloGame(),
		mostpickedmap: await mostPickedMap(),
		averageelo: await averageElo(),
		mostcapsinagame: await mostCapsInAGame(),
		mostreturns: await mostReturns(),
		mosttags: await mostTags(),
		mostprevent: await mostPrevent(),
		mostpups : await mostPups(),
	}
	console.log(data.mostpups)
	res.render('records', data);
}

/*
 most caps in a game
 most returns in a game
 most hold in a game
 most
 */

async function longestGame() {
	let raw = await db.select(`
		SELECT
			game.id,
			-- duration time
			TO_CHAR(duration * interval '1 sec', 'MI')
			|| ' minutes, ' ||
			TO_CHAR(duration * interval '1 sec', 'SS')
			|| ' seconds' as time,

			euid,

			redcaps,
			bluecaps,
			winner,
			map.name as map,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM game
		LEFT JOIN map ON map.id = game.mapid
		order by duration desc
		LIMIT 1
	`, [], 'row')

	raw.players = await db.select(`
		SELECT
			player.name,
			team
		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		WHERE playergame.gameid = ${raw.id}
	`, [], 'all')

	return raw
}

async function shortestGame() {
	let raw = await db.select(`
		SELECT
			game.id,
			duration || ' seconds' as time,
			euid,
			map.name as map,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM game
		LEFT JOIN map ON map.id = game.mapid
		order by duration asc
		LIMIT 1
	`, [], 'row')

	return raw
}

async function mostPickedMap() {
	let raw = await db.select(`
		SELECT
			count(*) as total,
			map.name as map
		FROM game
		LEFT JOIN map ON map.id = game.mapid
		GROUP BY map.name
		order by total DESC
		LIMIT 1
	`, [], 'row')

	return raw
}

async function highestEloGame() {
	let raw = await db.select(`
		SELECT
			game.id,
			elo,
			euid,
			map.name as map,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM game
		LEFT JOIN map ON map.id = game.mapid
		ORDER BY elo DESC
		LIMIT 1
	`, [], 'row')

	return raw
}

async function lowestEloGame() {
	let raw = await db.select(`
		SELECT
			game.id,
			elo,
			euid,
			map.name as map,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM game
		LEFT JOIN map ON map.id = game.mapid
		ORDER BY elo ASC
		LIMIT 1
	`, [], 'row')

	return raw
}

async function averageElo() {
	let raw = await db.select(`
		SELECT
			ROUND(sum(elo)::NUMERIC / count(*),2) as elo
		FROM game
		LIMIT 1
	`, [], 'row')

	return raw
}

async function mostCapsInAGame() {
	let raw = await db.select(`
		SELECT
			player.name,
			cap,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY cap DESC
		LIMIT 1
	`, [], 'row')

	return raw
}

async function mostReturns() {
	let raw = await db.select(`
		SELECT
			player.name,
			return as returns,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY returns DESC
		LIMIT 1
	`, [], 'row')

	return raw
}

async function mostTags() {
	let raw = await db.select(`
		SELECT
			player.name,
			tag,
			return,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY tag DESC
		LIMIT 1
	`, [], 'row')

	return raw
}

async function mostPrevent() {
	let raw = await db.select(`
		SELECT
			player.name,
			TO_CHAR(prevent * interval '1 sec', 'MI:SS') as prevent,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY prevent DESC
		LIMIT 1
	`, [], 'row')

	return raw
}

async function mostPups() {
	let raw = await db.select(`
		SELECT
			player.name,
			(pup_tp + pup_rb + pup_jj) as pups,
			euid,
			TO_CHAR(date, 'DD Month YYYY') as date

		FROM playergame
		LEFT JOIN player ON playergame.playerid = player.id
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE duration <= 480
		ORDER BY pups DESC
		LIMIT 1
	`, [], 'row')

	return raw
}
