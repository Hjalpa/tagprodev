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
		select
			tp_game.id,
			tp_game.uuid,
			tp_game.id,
			tp_game.winner,
			tp_game.redcaps,
			tp_game.bluecaps,
			TO_CHAR(duration * INTERVAL '1 millisecond', 'MI:SS') as duration,
			tp_game.datetime,

			tp_map.name as map,
			tp_server.name as server,

          ARRAY(
				select json_build_object('name', tp_player.name, 'flair', tp_playergame.flair)
                from tp_playergame
                left join tp_player on tp_player.id = tp_playergame.playerid
                where tp_playergame.gameid = tp_game.id and tp_playergame.team = 1
            ) AS red_team,
          ARRAY(
				select json_build_object('name', tp_player.name, 'flair', tp_playergame.flair)
                from tp_playergame
                left join tp_player on tp_player.id = tp_playergame.playerid
                where tp_playergame.gameid = tp_game.id and tp_playergame.team = 2
            ) AS blue_team

		FROM tp_game
		LEFT JOIN tp_map ON tp_map.id = tp_game.mapid
		LEFT JOIN tp_server ON tp_server.id = tp_game.serverid
		ORDER BY tp_game.datetime DESC
		LIMIT 10
	`, [], 'all')

	return raw
}
