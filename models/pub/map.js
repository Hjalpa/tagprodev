const db = require ('../../lib/db')

module.exports.init = async (req, res) => {
	try {
		let map = await getMapData(req.params.mapName)
		let mapID = map.id
		let mapName = map.name
		let tpid = req.params.profileID
		res.json({
			name: mapName,
			leaders: await getLeaders(mapID),
			stats: {
				all: await getAllStats(mapID),
				mine: await getMyStats(mapID, tpid),
			},
			games: {
				all: await getAllRecentGames(mapID),
				mine: await getMyRecentGames(mapID, tpid),
			}
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getMapData(mapName) {
	let raw = await db.select(`
		SELECT
			id, name
		FROM tp_map
		WHERE name = $1
		LIMIT 1
	`, [mapName.replace(/-/g, ' ')], 'row')

	return raw
}

async function getLeaders(mapID) {
	let raw = await db.select(`
		WITH data as (
			select
				tp_player.name,
				tp_player.tpid as profile,
				(SELECT flair from tp_playergame where playerid = tp_player.id order by datetime DESC limit 1) flair,

				COUNT(*)::real as games,
				COUNT(*) filter (WHERE tp_playergame.winner = true)::real as wins,
				COUNT(*) filter (WHERE tp_playergame.winner = false)::real as losses,
				ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS winrate,
				ROUND(COUNT(*) FILTER (WHERE tp_playergame.cap_team_for - tp_playergame.cap_team_against = 3 AND tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::real AS mercyrate,
				to_char(avg(tp_playergame.duration) * interval '1 second', 'MI:SS') AS avgduration,

				ROUND(AVG(tp_playergame.cap_team_for)::decimal, 2)::real as CF,
				ROUND(AVG(tp_playergame.cap_team_against)::decimal, 2)::real as CA,
				ROUND(AVG(tp_playergame.cap_team_for - tp_playergame.cap_team_against)::decimal, 2)::real as CD,

				MAX(tp_playergame.datetime) as lastgame,

				array(
					SELECT jsonb_build_object(
						'tpid', tp_g.tpid,
						'winner', tp_pg.winner
					)
					FROM tp_playergame as tp_pg
					LEFT JOIN tp_game as tp_g on tp_g.id = tp_pg.gameid
					WHERE tp_pg.playerid = tp_player.id AND tp_pg.saveattempt = false AND tp_g.mapid = tp_game.mapid
					ORDER BY tp_pg.datetime DESC
					LIMIT 10
				) AS form

			from tp_playergame
			left join tp_player on tp_player.id = tp_playergame.playerid
			left join tp_game on tp_game.id = tp_playergame.gameid
			where tp_player.tpid IS NOT NULL AND (tp_playergame.winner = true OR (tp_playergame.saveattempt = false AND tp_playergame.winner = false))
            AND tp_game.mapid = $1
			group by tp_player.name, tp_player.id, tp_game.mapid, tp_player.tpid
			order by games DESC, winrate DESC
			limit 175
		)
		SELECT
			RANK() OVER (
				ORDER BY winrate DESC, games DESC
			) as rank,
			name,
			profile,
			flair,
			games,
			wins,
			losses,
			winrate,
			mercyrate,
			avgduration,
			cf,
			ca,
			cd,
            lastgame,
			form
		FROM data order by rank
		LIMIT 100
	`, [mapID], 'all')

	return raw
}

async function getAllRecentGames(mapID) {
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
					'multiuser', tp_player.multiuser,
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
					'multiuser', tp_player.multiuser,
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
		WHERE mapid = $1
		ORDER BY tp_game.datetime DESC
		LIMIT 20
	`, [mapID], 'all')

	return raw
}

async function getMyRecentGames(mapID, tpID) {
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
					'multiuser', tp_player.multiuser,
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
					'multiuser', tp_player.multiuser,
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
		WHERE tp_map.id = $1 AND tp_p.tpid = $2
		ORDER BY tp_game.datetime DESC
		LIMIT 15
	`, [mapID, tpID], 'all')

	return raw
}

async function getAllStats(mapID) {
	let raw = await db.select(`
		SELECT
			count(*)::real as games,
			to_char(avg(duration) * interval '1 millisecond', 'MI:SS') AS avg_duration,
			round(avg(redcaps + bluecaps), 2)::real as avg_caps_per_game,
			round(count(*) FILTER (WHERE (redcaps - bluecaps = 3) OR (bluecaps - redcaps = 3)) * 100.0 / COUNT(*), 2)::real AS mercy_percentage,
			round(count(*) FILTER (WHERE duration >= 370100) * 100.0 / COUNT(*), 2)::real AS overtime_percentage,

			max(datetime) as lastgame,

			round(avg(redcaps), 2)::real as avg_red_caps,
			round(avg(bluecaps), 2)::real as avg_blue_caps,

			round(AVG((prediction->>'red')::numeric), 2)::real AS avg_red_prediction,
			round(AVG((prediction->>'blue')::numeric), 2)::real AS avg_blue_prediction,

			to_char(max(duration) * interval '1 millisecond', 'MI:SS') AS max_duration,
			(select tpid from tp_game where mapid = $1 order by duration desc limit 1) as max_duration_tpid,

			round(max(redcaps + bluecaps), 0) as most_caps,
			(select tpid from tp_game where mapid = $1 order by (redcaps+bluecaps) desc limit 1) as most_caps_tpid

		FROM tp_game
		WHERE mapid = $1
		group by mapid
	`, [mapID], 'row')

	return raw
}

async function getMyStats(mapID, tpID) {
	let raw = await db.select(`
		SELECT
			count(*)::real as games,
			to_char(avg(tp_playergame.duration) * interval '1 second', 'MI:SS') AS avg_duration,
			round(avg(redcaps + bluecaps), 2)::real as avg_caps_per_game,
			round(count(*) FILTER (WHERE (redcaps - bluecaps = 3) OR (bluecaps - redcaps = 3)) * 100.0 / COUNT(*), 2)::real AS mercy_percentage,
			round(count(*) FILTER (WHERE tp_game.duration >= 370100) * 100.0 / COUNT(*), 2)::real AS overtime_percentage,

			max(tp_game.datetime) as lastgame,

			round(avg(redcaps), 2)::real as avg_red_caps,
			round(avg(bluecaps), 2)::real as avg_blue_caps,

			round(AVG((prediction->>'red')::numeric), 2)::real AS avg_red_prediction,
			round(AVG((prediction->>'blue')::numeric), 2)::real AS avg_blue_prediction,

			to_char(max(tp_game.duration) * interval '1 millisecond', 'MI:SS') AS max_duration,
			(
				select tp_game.tpid
				from tp_game
				LEFT JOIN tp_playergame ON tp_playergame.gameid = tp_game.id
				LEFT JOIN tp_player ON tp_player.id = tp_playergame.playerid
				where mapid = $1 and tp_player.tpid = $2
				order by tp_game.duration desc
				limit 1
			) as max_duration_tpid,

			round(max(redcaps + bluecaps), 0) as most_caps,
			(
				select tp_game.tpid
				from tp_game
				LEFT JOIN tp_playergame ON tp_playergame.gameid = tp_game.id
				LEFT JOIN tp_player ON tp_player.id = tp_playergame.playerid
				where mapid = $1 and tp_player.tpid = $2
				order by (tp_game.redcaps+bluecaps) desc
				limit 1
			) as most_caps_tpid

		FROM tp_game
		LEFT JOIN tp_playergame ON tp_playergame.gameid = tp_game.id
		LEFT JOIN tp_player ON tp_player.id = tp_playergame.playerid
		WHERE mapid = $1 AND tp_player.tpid = $2 AND (tp_playergame.winner = true OR (tp_playergame.saveattempt = false AND tp_playergame.winner = false))
		GROUP BY mapid
	`, [mapID, tpID], 'row')

	return raw
}

module.exports.all = async (req, res) => {
	try {
		res.json(await getMaps())
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getMaps() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY count(*) DESC
			) as rank,
			tp_map.name,
			COUNT(*) AS games,
			to_char(avg(duration) * interval '1 millisecond', 'MI:SS') AS avg_duration,
			round(avg(redcaps + bluecaps), 2) as avg_caps_per_game,
			Round(count(*) FILTER (WHERE (redcaps - bluecaps = 3) OR (bluecaps - redcaps = 3)) * 100.0 / COUNT(*), 2) AS mercy_percentage,
			Round(count(*) FILTER (WHERE duration >= 360100) * 100.0 / COUNT(*), 2) AS overtime_percentage,

			round((COUNT(*) FILTER (WHERE winner = 1) * 100.0 / COUNT(*)), 2) as red_win_percentage,
			round((COUNT(*) FILTER (WHERE winner = 2) * 100.0 / COUNT(*)), 2) as blue_win_percentage,

			max(tp_game.datetime) as lastgame,
			max(redcaps + bluecaps) as max_caps

		FROM
			tp_game
		LEFT JOIN tp_map ON tp_map.id = tp_game.mapid
		GROUP BY tp_map.id, tp_map.name
		HAVING count(*) > 20
		ORDER BY games DESC
		LIMIT 100
	`, [], 'all')

	return raw
}
