const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.list = async (req, res) => {
	let data = {
		config: {
			nav: 'players',
			title: 'Players',
		},
		players: await getPlayers(req.query),
		filters: req.query,
	}
	res.render('admin-players.pug', data)

	async function getPlayers(query) {
		let players = {}

		if (!('name' in req.query) || req.query.name === '')
			players = await db.select(`
				WITH RankedPlayers AS (
					SELECT
						p.id,
						p.country,
						p.name,
						ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY g.date DESC) AS rn,
						g.date
					FROM player p
					INNER JOIN playergame pg ON pg.playerid = p.id
					INNER JOIN game g ON g.id = pg.gameid
					WHERE p.country IS NOT NULL
				)
				SELECT
					rp.id,
					rp.country,
					rp.name,
					(SELECT COUNT(*) FROM playergame WHERE playerid = rp.id) AS games,
					(SELECT COUNT(*) FROM seasonplayer WHERE playerid = rp.id) AS seasons,
					rp.date
				FROM RankedPlayers rp
				WHERE rp.rn = 1
				ORDER BY rp.date DESC
				OFFSET 0 ROWS FETCH NEXT 200 ROWS ONLY;
			`, [], 'all')

		else {
			const filters = {
				where: [],
				clause: [],
			}

			let term = query.name.replace(/\s+/g, ' ').trim()
			filters.where.push('name ilike $1')
			filters.clause.push('%'+term+'%')

			players = await db.select(`
				WITH RankedPlayers AS (
					SELECT
						p.id,
						p.country,
						p.name,
						ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY g.date DESC) AS rn,
						g.date
					FROM player p
					INNER JOIN playergame pg ON pg.playerid = p.id
					INNER JOIN game g ON g.id = pg.gameid
					WHERE p.country IS NOT NULL
				)
				SELECT
					rp.id,
					rp.country,
					rp.name,
					(SELECT COUNT(*) FROM playergame WHERE playerid = rp.id) AS games,
					(SELECT COUNT(*) FROM seasonplayer WHERE playerid = rp.id) AS seasons,
					rp.date
				FROM RankedPlayers rp
				WHERE rp.rn = 1
					AND
					${filters.where.join(' OR ')}
				ORDER BY rp.date DESC, CHAR_LENGTH(name)
				OFFSET 0 ROWS FETCH NEXT 200 ROWS ONLY;
			`, filters.clause, 'all')
		}

		for(let u in players) {
			let item = players[u]

			if(players[u].date)
				players[u].activity = util.displayDate(item.date, 'day month year')

			delete players[u].date
		}

		return players
	}
}

module.exports.edit = async (req, res) => {
	let user = await getUsers(req.params.playerID)

	if(!user) {
		res.status(404).send('no user found for: ' + req.params.playerID)
		return false
	}

	// user.joined = util.formatDate(user.joined)

	let data = {
		config: {
			nav: 'players',
			title: user.name + ' edit',
		},
		user
	}
	res.render('admin-players-edit.pug', data)

	async function getUsers(playerID) {
		return await db.select(`SELECT * FROM player WHERE id = $1`, [playerID], 'row')
	}
}
