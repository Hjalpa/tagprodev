const axios = require('axios')
const db = require ('../../lib/db')
const util = require ('../../lib/util')
const openskill = require ('../../lib/openskill')

module.exports.import = async (req, res) => {
	try {
		console.log('running pub importer...')

		let url = 'https://tagpro.koalabeast.com/history/data?page=0&pageSize=50'
		let raw = await axios.get(url)

		raw.headers['content-type']
		const data = raw.data.games
		data.reverse()

		for await(let row of data) {
			let exists = await db.select('SELECT id FROM tp_game WHERE tpid = $1', [row.id], 'id')
			if(!exists)
				await makeGame(row)
		}
	}

	catch(e) {
		res.json({success:false,error: e})
	}

	finally {
		res.json({success:true})
	}
}

async function makeGame(data) {
	let gameExists = await db.select('SELECT id FROM tp_game WHERE tpid = $1', [data.id], 'id')
	if(!gameExists && (data.id && data.uuid)) {
		try {
			// get players and validate
			let players = await getPlayers(data)
			// save game
			let gameID = await saveGame(data)
			// save players
			await savePlayers(players, gameID, data)
			// update openskill
			await openskill.rank(gameID)
		}
		catch(error) {
			console.log(error)
		}
	}
}

async function saveGame(raw) {
	let data = {
		tpid: raw.id,
		uuid: raw.uuid,
		visibility: (raw.visibility === 'Public' ? true : false),
		datetime: raw.started,
		duration: raw.duration,
		mapid: await getMapID(raw.mapName),
		serverid: await getServerID(raw.server),
		winner: raw.winner,
		redcaps: raw.teams.red.score,
		bluecaps: raw.teams.blue.score
	}

	if(data.winner === -1)
		throw 'Tied games are ignored'

	if(raw.visibility != 'Public')
		throw 'Private games are ignored'

	let gameID = await db.insert('tp_game', data)

	if(!gameID)
		throw 'Could not save tp_game: ' + db.error

	return gameID
}

async function getMapID(mapName) {
	let mapID = await db.select('SELECT id FROM tp_map WHERE name = $1', [mapName], 'id')

	if(!mapID) {
		let data = {
			name: mapName
		}
		mapID = await db.insert('tp_map', data)
	}

	if(!mapID)
		throw 'map not found and could not create: ' + mapName

	return mapID
}

async function getServerID(serverName) {
	let serverID = await db.select('SELECT id FROM tp_server WHERE name = $1', [serverName], 'id')

	if(!serverID) {
		let data = {
			name: serverName
		}
		serverID = await db.insert('tp_server', data)
	}

	if(!serverID)
		throw 'server not found and could not create: ' + serverName

	return serverID
}

async function getPlayers(data) {
	// download file and grab players
	let downloadFile = `https://tagpro.koalabeast.com/history/gameFile?gameId=${data.id}&userId=`
	let raw = await axios.get(downloadFile)

	raw.headers['content-type']

	// find players
	let lines = raw.data.trim().split('\n')
	for (let line of lines) {
		if(line.includes('recorder-metadata')) {
			let jsonArray = await JSON.parse(line)
			let players = jsonArray[2].players

			let rawPlayers = []
			for(let player of players) {
				let timePlayed = getTimestampDifferenceInSeconds(player.joined, player.left)
				if(timePlayed >= 30) {
					player.flair = await getFlair(player.displayName, raw.data.trim().split('\n'))
					rawPlayers.push(player)
				}
			}

			if(rawPlayers.length < 8)
				throw 'There are not enough players playing: ' + rawPlayers.length

			// remove duplicate players
			rawPlayers = removePlayerDuplicatesAndPreserveNull(rawPlayers)

			// check that there are at least 3 players on each team
			let evenTeams = checkEvenTeams(rawPlayers)
			if(!evenTeams)
				throw 'Teams are not even'

			return rawPlayers
		}
	}
}

async function getFlair(playerName, lines) {
	for (let line of lines) {
		if(line.includes(playerName) && line.includes('flair":{"x":')) {
			let json = await JSON.parse(line)
			if(json[2][0].flair)
				return {
					x: json[2][0].flair.x,
					y: json[2][0].flair.y,
					className: json[2][0].flair.className
				}
		}
	}
	// if no flair
	return null
}

async function savePlayers(raw, gameID, rawData) {
	for await (const player of raw) {
		playerID = await getPlayerID(player)

		let data = {
			playerid: parseInt(playerID),
			gameid: parseInt(gameID),
			finished: player.finished,
			duration: getTimestampDifferenceInSeconds(player.joined, player.left),
			team:  player.team,
			winner: isWinner(player, rawData),
			cap_team_for: rawData.teams[(player.team == 1 ? 'red' : 'blue')].score,
			cap_team_against: rawData.teams[(player.team == 2 ? 'red' : 'blue')].score,
			flair: player.flair,
			datetime: rawData.started,
		}

		let playerGameID = await db.insert('tp_playergame', data)

		if(!playerGameID) {
			throw `Could not save player game data: ${db.error}`
		}
	}
}

async function getPlayerID(player) {
	let playerID = await db.select(`
		SELECT id
		FROM tp_player
		WHERE
		(
			tpid = $1 AND tpid IS NOT null
		)
		OR
		(
			tpid IS NULL AND LOWER(name) = LOWER($2)
		)
	`, [player.userId, player.displayName], 'id')

	if(!playerID) {
		let data = {
			name: player.displayName,
			tpid: player.userId,
		}
		playerID = await db.insert('tp_player', data)
	}

	if(!playerID)
		throw `player not found and could not create: ${db.error}`

	return playerID
}

function getTimestampDifferenceInSeconds(timestamp1, timestamp2) {
	const date1 = new Date(timestamp1)
	const date2 = new Date(timestamp2)

	const differenceInMilliseconds = date2 - date1

	return differenceInMilliseconds / 1000
}

function isWinner(player, gameData) {
	if(player.finished === false)
		return false
	else if (gameData.winner === player.team)
		return true
	else
		return false
}

function removePlayerDuplicatesAndPreserveNull(arr) {
  const seen = {};
  const result = [];

  arr.reverse()

  arr.forEach((item) => {
    if (item.userId === null || !seen[item.userId]) {
      result.push(item);
      seen[item.userId] = true;
    }
  });

  return result;
}

function checkEvenTeams(arr) {
  const teamCounts = {};

  // Count the number of entries for each team
  arr.forEach((item) => {
    const teamId = item.team;
    teamCounts[teamId] = (teamCounts[teamId] || 0) + 1;
  });

  // Check if each team has at least 3 entries
  const team1Count = teamCounts[1] || 0;
  const team2Count = teamCounts[2] || 0;

  return team1Count >= 4 && team2Count >= 4;
}
