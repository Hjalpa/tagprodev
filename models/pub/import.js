const axios = require('axios')
const db = require ('../../lib/db')
const openskill = require ('../../lib/openskill')
const routeCache = require('route-cache')

module.exports.import = async (req, res) => {
	try {
		console.log('.... start import ........')

		let url = 'https://tagpro.koalabeast.com/history/data?page=0&pageSize=50'
		// let url = 'https://tagpro.koalabeast.com/history/data?userId=52d14ba81c0f1b1421277d0c&page=0&pageSize=1'
		let raw = await axios.get(url)

		raw.headers['content-type']
		const data = raw.data.games
		data.reverse()

		for await(let row of data) {
			let exists = await db.select('SELECT id FROM tp_gameexclude WHERE tpid = $1', [row.id], 'id')
			if(!exists)
				await makeGame(row)

				return false
		}

		console.log('.... end export ..........')
	}

	catch(e) {
		res.json({success:false,error: e})
	}

	finally {
		routeCache.clearCache()
		await axios.get('https://tagpro.dev/api/pub/leaderboard')
		res.json({success:true})
	}
}

async function makeGame(data) {
	let gameExists = await db.select('SELECT id FROM tp_game WHERE tpid = $1', [data.id], 'id')
	if(!gameExists && (data.id && data.uuid)) {
		try {
			// get players and validate
			let players = await getPlayers(data)
			console.log(players)
			// save game
			let gameID = await saveGame(data)
			// save players
			await savePlayers(players, gameID, data)
			// update openskill
			await openskill.rank(gameID)
		}
		catch(error) {
			await db.insert('tp_gameexclude', {
				tpid: data.id,
				error: error
			})
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
				if(timePlayed >= 10) {
					player.flair = await getFlair(player.id, raw.data.trim().split('\n'))
					player.degree = await getDegree(player.id, raw.data.trim().split('\n'))
					player.score = await getScore(player.id, raw.data.trim().split('\n'))
					rawPlayers.push(player)
				}
			}

			if(rawPlayers.length < 8)
				throw 'There are not enough players playing: ' + rawPlayers.length

			// remove duplicate players
			rawPlayers = removePlayerDuplicatesAndPreserveNull(rawPlayers)

			// check that there are at least 4 players on each team
			let evenTeams = checkEvenTeams(rawPlayers)
			if(!evenTeams)
				throw 'Teams are not even'

			// prevent people exploiting name change. e.g. start game with stats off and displayName, and switch to reservedName when about to win.
			rawPlayers = await preventExploitChangingNameAfterLoad(rawPlayers, raw.data.trim().split('\n'))

			// is save attempt
			rawPlayers = await isSaveAttempt(rawPlayers, raw.data.trim().split('\n'))

			return rawPlayers
		}
	}
}

async function getFlair(playerID, lines) {
	for (let line of lines) {
		if(line.includes(`{"id":${playerID}`) && line.includes('flair":{"x":')) {
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

async function getDegree(playerID, lines) {
	for (let line of lines) {
		if(line.includes(`{"id":${playerID}`) && line.includes('degree":')) {
			let json = await JSON.parse(line)
			if(json[2][0].degree) {
				return json[2][0].degree
			}
		}
	}
	// if no degree
	return null
}

async function getScore(playerID, lines) {
	let reverse = lines.reverse()
	for (let line of reverse) {

		const pattern = new RegExp('{"id":' + playerID + ',"score":(\\d+)}')
		const match = line.match(pattern)
		if (match)
			return parseInt(match[1])

		// if(line.includes(`{"id":${playerID}`) && line.includes('score":') && line.includes('important":true')) {
		// 	let json = await JSON.parse(line)
		// 	if(json[2][0].score) {
		// 		return json[2][0].score
		// 	}
		// }

		// if(line.includes(`[{"id":${playerID},"score":`)) {
		// 	let json = await JSON.parse(line)
		// 	// console.log(json[2][0].score)
		// 	if(json[2][0].score) {
		// 		return json[2][0].score
		// 	}
		// }
	}
	// if no score
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
			saveattempt: player.saveAttempt ? true: false,
			degrees: player.degrees,
			score: player.score
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
			tpid = $1 AND tpid IS NOT NULL
		)
		OR
		(
			tpid IS NULL AND $1 IS NULL and LOWER(name) = LOWER($2)
		)
	`, [player.userId, player.displayName], 'id')

	if(playerID && player.userId != null) {
		let data = {
			name: player.displayName
		}
		let condition = {
			tpid: player.userId,
		}
		await db.update('tp_player', data, condition)
	}

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
    const seenReal = {};
    const seenFake = {};
    const result = [];

    arr.reverse()

    for (let player of arr) {
        if (!seenReal[player.userId] && player.userId != null) { // real players. no duplicates
            result.push(player);
            seenReal[player.userId] = true;
        }
      else if (!seenFake[player.displayName] && player.userId == null) { // fake player
            result.push(player);
            seenFake[player.displayName] = true;
        }
    }

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

async function preventExploitChangingNameAfterLoad(players, lines) {
	const seen = {}
	for (let line of lines) {
		if(line.includes('from":null') && line.includes('has joined the')) {
			let arr = await JSON.parse(line)
			let playerData = arr[2]

			let id = playerData.for
			let name = playerData.message.split(' has joined the')[0]

			updateEntry(id, name, players)
		}

	}
	return players
}

function updateEntry(id, displayName, inputData) {
	const index = inputData.findIndex(entry => entry.id === id)
	if (index !== -1) {
		if(inputData[index].displayName != displayName) {
			inputData[index].displayName = displayName
			inputData[index].userId = null
		}
	}
}

async function isSaveAttempt(players, lines) {
	let scores = {r:0,b:0}

	for (let line of lines) {
		// keep track of scores
		if(line.includes('"score",{"r":')) {
			let arr = await JSON.parse(line)
			let time = arr[0]
			scores = arr[2]
		}

		// force save if the player joins in overtime
		if(line.includes('from":null') && line.includes('has joined the')) {
			let arr = await JSON.parse(line)
			let playerData = arr[2]

			let id = playerData.for
			let name = playerData.message.split(' has joined the')[0]

			let six_minutes = 360000
			let time = arr[0]
			if(time > six_minutes) {
				console.log(`${name} joined in overtime. This is a save attempt.`)
				players = addSaveKey(players, id)
			}
		}

		// force save if scores not balanced
		if(line.includes('from":null') && line.includes('has joined the')) {
			let arr = await JSON.parse(line)
			let playerData = arr[2]

			let id = playerData.for
			let name = playerData.message.split(' has joined the')[0]

			let rawTeam = playerData.message.split(' has joined the')[1]
			let team = rawTeam.split(' team.')[0].trim()

			if((scores.r > scores.b && team === 'Blue') || (scores.b > scores.r && team === 'Red')) {
				console.log(`${name} joined ${team} losing ${scores.r}:${scores.b}. This is a save attempt.`)
				players = addSaveKey(players, id)
			}
		}

		// standard save from playing with stats on
		if(line.includes('from":null,"message":"This is a save attempt! A loss will not negatively impact your win %.",')) {
			let arr = await JSON.parse(line)
			players = addSaveKey(players, arr[2].for)
		}
	}
	function addSaveKey(objects, playerID) {
		for (let i = 0; i < objects.length; i++) {
			if (objects[i].id === playerID) {
				objects[i].saveAttempt = true
			}
		}
		return objects
	}
	return players
}
