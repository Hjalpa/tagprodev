const exec = require('child_process').exec
const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.game = async (req, res) => await game(req, res)
let game = async (req, res) => {

	// first half
	let euid1 = req.body.data.half1.euids.split(',')
	if(euid1)
		for (const key in euid1)
			await makeGame({
				euid: euid1[key],
				half: 1,
				season: req.body.data.season,
				week: req.body.data.week,
				game: req.body.data.game,
				red: req.body.data.half1.red,
				blue: req.body.data.half1.blue,
			})

	// second half
	let euid2 = req.body.data.half2.euids.split(',')
	if(euid2)
		for (const key in euid2)
			await makeGame({
				euid: euid2[key],
				half: 2,
				season: req.body.data.season,
				week: req.body.data.week,
				game: req.body.data.game,
				red: req.body.data.half1.red,
				blue: req.body.data.half1.blue,
			})

	res.json({finished: true})
}

async function makeGame(tmp) {
    exec(`php ../tagpro-stats/index.php ${tmp.euid}`, async (error, raw) => {

        if(error)
            res.status(400).send(error)

		let data = JSON.parse(raw)
		console.log(data.game)

		try {
			let gameID = await saveGame(data.game, tmp)
			console.log(gameID)
		}
		catch(error) {
			await db.insert('errorlog', {
				error: error,
				raw: data,
				euid: tmp.euid
			})
			console.log(error)
		}
		finally {}

    })
}

async function saveGame(raw, tmp) {

	let data = {
		euid: raw.euid,
		date: raw.date,
		mapid: await getMapID(raw.map),
		serverid: await getServerID(raw.server),
		duration: raw.duration,
		seasonid: await getSeasonID(tmp.season),
		week: tmp.week,
		half: tmp.half,
		winner: await getResult(raw),
		redteamid: await getTeamID(tmp.red),
		blueteamid: await getTeamID(tmp.blue),
		redcaps: raw.redscore,
		bluecaps: raw.bluescore,
	}

	let gameID = await db.insert('game', data)

	if(!gameID)
		throw 'Could not save game: ' + db.error

	return gameID
}

async function getMapID(mapName) {
	let mapID = await db.select('SELECT id FROM map WHERE name = $1', [mapName], 'id')

	if(!mapID) {
		let data = {
			name: mapName
		}
		mapID = await db.insert('map', data)
	}

	if(!mapID)
		throw 'map not found and could not create: ' + mapName

	return mapID
}

async function getServerID(serverName) {
	let serverID = await db.select('SELECT id FROM server WHERE name = $1', [serverName], 'id')

	if(!serverID) {
		let data = {
			name: serverName
		}
		serverID = await db.insert('server', data)
	}

	if(!serverID)
		throw 'server not found and could not create: ' + serverName

	return serverID
}

async function getSeasonID(seasonName) {
	let seasonID = await db.select('SELECT id FROM season WHERE name = $1', [seasonName], 'id')

	if(!seasonID) {
		let data = {
			name: seasonName
		}
		seasonID = await db.insert('season', data)
	}

	if(!seasonID)
		throw 'season not found and could not create: ' + seasonName

	return seasonID
}

async function getTeamID(teamName) {
	let teamID = await db.select('SELECT id FROM team WHERE name = $1', [teamName], 'id')

	if(!teamID) {
		let data = {
			name: teamName
		}
		teamID = await db.insert('team', data)
	}

	if(!teamID)
		throw 'team not found and could not create: ' + teamName

	return teamID
}

async function getResult(raw) {
	if(raw.redscore === raw.bluescore)
		return 't'
	else if(raw.redscore > raw.bluescore)
		return 'r'
	else
		return 'b'
}
