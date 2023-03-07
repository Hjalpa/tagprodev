const exec = require('child_process').exec
const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.game = async (req, res) => await game(req, res)
let game = async (req, res) => {
	if(req.body.euid && req.body.seasonid)
		await makeGame(req.body, res)
}

async function makeGame(param, res) {
	let gameExists = await db.select('SELECT id FROM game WHERE euid = $1', [param.euid], 'id')
	if(!gameExists)
		exec(`php stat-gen/index.php ${param.euid}`, async (error, raw) => {

			if(error)
				res.status(400).send(error)

			let data = JSON.parse(raw)
			data.game.seasonid = param.seasonid

			try {
				let gameID = await saveGame(data.game)
				await savePlayers(data.players, gameID)
			}
			catch(error) {
				await db.insert('errorlog', {
					error: error,
					raw: data,
					euid: param.euid
				})

				console.log(error)
			} finally {
				res.json(data)
			}

		})
}

async function savePlayers(raw, gameID) {
	for await (const player of raw) {
		let data = player

		data.playerid = await getPlayerID(player.name.toLowerCase())
		data.gameid = gameID

		// clean up
		delete data.name

		await db.insert('playergame', data)
	}
}

async function saveGame(raw) {

	let data = {
		euid: raw.euid,
		date: raw.date,
		datetime: raw.datetime,
		duration: raw.duration,
		mapid: await getMapID(raw.map),
		serverid: await getServerID(raw.server),
		seasonid: raw.seasonid,
		winner: await getResult(raw),
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

async function getResult(raw) {
	if(raw.redscore === raw.bluescore)
		return 't'
	else if(raw.redscore > raw.bluescore)
		return 'r'
	else
		return 'b'
}


async function getPlayerID(playerName) {
	let playerID = await db.select('SELECT id FROM player WHERE name = $1', [playerName], 'id')

	if(!playerID) {
		let data = {
			name: playerName
		}
		playerID = await db.insert('player', data)
	}

	if(!playerID)
		throw 'player not found and could not create: ' + playerName

	return playerID
}
