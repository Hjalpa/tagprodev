const db = require ('../../lib/db')

module.exports.openskill = async (req, res) => {
	try {
		const name = req.params.name
		const auth = (req.query.auth === 'true') ? true : false
		res.json({
			openskill: await getOpenSkill(name, auth),
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getOpenSkill(name, auth = false) {
	let tpid = (auth ? 'tp_player.tpid IS NOT NULL' : 'tp_player.tpid IS NULL')
	let raw = await db.select(`
		SELECT
			openskill
		FROM tp_playergame
		LEFT JOIN tp_player ON tp_playergame.playerid = tp_player.id
		WHERE LOWER(name) = LOWER($1) AND ${tpid}
		ORDER BY tp_playergame.datetime DESC
		LIMIT 1
	`, [name], 'openskill')

	return raw ? parseFloat(raw.toFixed(2)) : '-'
}

module.exports.playercompare = async (req, res) => {
	try {
		let _p1 = {
			name: req.query.p1,
			auth: (req.query.p1_auth === 'true') ? true : false,
		}
		let p1 = await getPlayer(_p1)

		let _p2 = {
			name: req.query.p2,
			auth: (req.query.p2_auth === 'true') ? true : false,
		}
		let p2 = await getPlayer(_p2)

		res.json({
			winPercentages: {
				together: await getWith(p1, p2) || { games: 0, wins: 0, winrate: 0 },
				against: await getAgainst(p1, p2) || { games: 0, wins: 0, winrate: 0 },
			}
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getPlayer(player) {
	let tpid = (player.auth ? 'tp_player.tpid IS NOT NULL' : 'tp_player.tpid IS NULL')
	let raw = await db.select(`
		SELECT id
		FROM tp_player
		WHERE LOWER(name) = LOWER($1) AND ${tpid}
		LIMIT 1
	`, [player.name], 'id')

	return raw
}

async function getWith(p1, p2) {
	let raw = await db.select(`
		select
			count(*)::real as games,
			count(*) filter (where tp_pg_main.winner = true)::real as wins,
			round(count(*) filter (where tp_pg_main.winner = true)::decimal / count(*)::decimal * 100, 2)::real as winrate
		from tp_game
		left join tp_playergame as tp_pg_main on tp_pg_main.gameid = tp_game.id
		right join tp_playergame as tp_pg_second on tp_pg_second.gameid = tp_game.id
		WHERE tp_pg_main.playerid = $1 AND tp_pg_second.playerid = $2 AND tp_pg_main.team = tp_pg_second.team;
	`, [p1, p2], 'row')

	return raw
}

async function getAgainst(p1, p2) {
	let raw = await db.select(`
		select
			count(*)::real as games,
			count(*) filter (where tp_pg_main.winner = true)::real as wins,
			round(count(*) filter (where tp_pg_main.winner = true)::decimal / count(*)::decimal * 100, 2)::real as winrate
		from tp_game
		left join tp_playergame as tp_pg_main on tp_pg_main.gameid = tp_game.id
		right join tp_playergame as tp_pg_second on tp_pg_second.gameid = tp_game.id
		WHERE tp_pg_main.playerid = $1 AND tp_pg_second.playerid = $2 AND tp_pg_main.team != tp_pg_second.team;
	`, [p1, p2], 'row')

	return raw
}
