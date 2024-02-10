const db = require ('../../lib/db')

module.exports.init = async (req, res) => {
	try {
		res.json({
			games: await getGames(),
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getGames() {
	let raw = await db.select(`
		SELECT
			tp_game.id,
			tp_game.uuid,
			tp_game.tpid,
			tp_game.winner,
			tp_game.redcaps,
			tp_game.bluecaps,
			TO_CHAR(duration * INTERVAL '1 millisecond', 'MI:SS') as duration,
			tp_game.datetime,
			tp_game.prediction,

			tp_map.name as map,
			tp_server.name as server,

			ARRAY(
				select json_build_object(
					'name', tp_player.name,
					'flair', pg.flair,
					'tpid', tp_player.tpid,
					'openskill_change', Round(pg.openskill::decimal - COALESCE(xpg.openskill::decimal, 0), 2)::real,
					'openskill', Round(pg.openskill::decimal, 2)::real,
					'finished', pg.finished
				)
				from tp_playergame as pg
				left join tp_player on tp_player.id = pg.playerid
				LEFT JOIN tp_playergame as xpg ON tp_player.id = xpg.playerid AND xpg.datetime = (
					SELECT max(datetime)
					FROM tp_playergame
					WHERE playerid = tp_player.id AND tp_playergame.gameid < pg.gameid
				)
				where pg.gameid = tp_game.id and pg.team = 1
				ORDER BY pg.finished DESC, pg.openskill DESC
			) AS red_team,
			ARRAY(
				select json_build_object(
					'name', tp_player.name,
					'flair', pg.flair,
					'tpid', tp_player.tpid,
					'openskill_change', Round(pg.openskill::decimal - COALESCE(xpg.openskill::decimal, 0), 2)::real,
					'openskill', Round(pg.openskill::decimal, 2)::real,
					'finished', pg.finished
				)
				from tp_playergame as pg
				left join tp_player on tp_player.id = pg.playerid
				LEFT JOIN tp_playergame as xpg ON tp_player.id = xpg.playerid AND xpg.datetime = (
					SELECT max(datetime)
					FROM tp_playergame
					WHERE playerid = tp_player.id AND tp_playergame.gameid < pg.gameid
				)
				where pg.gameid = tp_game.id and pg.team = 2
				ORDER BY pg.finished DESC, pg.openskill DESC
			) AS blue_team

		FROM tp_game
		LEFT JOIN tp_map ON tp_map.id = tp_game.mapid
		LEFT JOIN tp_server ON tp_server.id = tp_game.serverid
		ORDER BY tp_game.datetime DESC
		LIMIT 15
	`, [], 'all')

        // WHERE
		// (
			// (
				// ((tp_game.prediction->>'red')::DECIMAL BETWEEN 0 AND 0.3) AND tp_game.winner = 1
			// )
			// OR
			// (
				// ((tp_game.prediction->>'blue')::DECIMAL BETWEEN 0 AND 0.3) AND tp_game.winner = 2
			// )
		// )

	return raw
}

module.exports.playerRecentGames = async (req, res) => {
	try {
		const profileID = req.params.profileID
		res.json({
			games: await getPlayerRecentGames(profileID, req),
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getPlayerName(profileID) {
	let raw = await db.select(`
		SELECT
			name
		FROM tp_player
		WHERE tpid = $1
		LIMIT 1
	`, [profileID], 'name')

	return raw
}

async function getPlayerRecentGames(tpid, req) {
	let playerName = await getPlayerName(tpid)
	let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
	console.log(`recent games: ${playerName} :: ${ip}`)
	if(ip && tpid)
		await logIP(tpid, ip)

	let raw = await db.select(`
		SELECT
			tp_game.id,
			tp_game.uuid,
			tp_game.tpid,
			tp_game.winner,
			tp_game.redcaps,
			tp_game.bluecaps,
			TO_CHAR(tp_pg.duration * INTERVAL '1 millisecond', 'MI:SS') as duration,
			tp_game.datetime,
			tp_game.prediction,
			tp_map.name as map,
			tp_server.name as server,

			ARRAY(
				select json_build_object(
					'name', tp_player.name,
					'flair', pg.flair,
					'tpid', tp_player.tpid,
					'openskill_change', Round(pg.openskill::decimal - COALESCE(xpg.openskill::decimal, 0), 2)::real,
					'openskill', Round(pg.openskill::decimal, 2)::real,
					'finished', pg.finished
				)
				from tp_playergame as pg
				left join tp_player on tp_player.id = pg.playerid
				LEFT JOIN tp_playergame as xpg ON tp_player.id = xpg.playerid AND xpg.datetime = (
					SELECT max(datetime)
					FROM tp_playergame
					WHERE playerid = tp_player.id AND tp_playergame.gameid < pg.gameid
				)
				where pg.gameid = tp_game.id and pg.team = 1
				ORDER BY pg.finished DESC, pg.openskill DESC
			) AS red_team,
			ARRAY(
				select json_build_object(
					'name', tp_player.name,
					'flair', pg.flair,
					'tpid', tp_player.tpid,
					'openskill_change', Round(pg.openskill::decimal - COALESCE(xpg.openskill::decimal, 0), 2)::real,
					'openskill', Round(pg.openskill::decimal, 2)::real,
					'finished', pg.finished
				)
				from tp_playergame as pg
				left join tp_player on tp_player.id = pg.playerid
				LEFT JOIN tp_playergame as xpg ON tp_player.id = xpg.playerid AND xpg.datetime = (
					SELECT max(datetime)
					FROM tp_playergame
					WHERE playerid = tp_player.id AND tp_playergame.gameid < pg.gameid
				)
				where pg.gameid = tp_game.id and pg.team = 2
				ORDER BY pg.finished DESC, pg.openskill DESC
			) AS blue_team

		FROM tp_playergame as tp_pg
		LEFT JOIN tp_game on tp_pg.gameid = tp_game.id
		LEFT JOIN tp_player as tp_p ON tp_pg.playerid = tp_p.id
		LEFT JOIN tp_map ON tp_map.id = tp_game.mapid
		LEFT JOIN tp_server ON tp_server.id = tp_game.serverid
		WHERE tp_p.tpid = $1
		ORDER BY tp_game.datetime DESC
		LIMIT 15
	`, [tpid], 'all')

	return raw
}

async function getPlayerID(profileID) {
	let raw = await db.select(`
		SELECT
			id
		FROM tp_player
		WHERE tpid = $1
		LIMIT 1
	`, [profileID], 'id')

	return raw
}

async function logIP(profileID, ip) {
	let playerID = getPlayerID(profileID)
	if(playerID)
		let raw = await db.insert('tp_playerip', {ip: ip}, {playerid: playerID})
	else
		console.log(`could not log ip for player profile id: ${profileID}`)
}
