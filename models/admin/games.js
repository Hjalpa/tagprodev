const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.list = async (req, res) => {
	let data = {
		config: {
			nav: 'games',
			title: 'Games',
		},
		games: await getGames(req.query),
		filters: req.query,
	}
	res.render('admin-games.pug', data)

	async function getGames(query) {
		let games= {}

		if (!('name' in req.query) || req.query.name === '')
			games= await db.select(`
				SELECT * FROM game ORDER BY id DESC LIMIT 200
			`, [], 'all')

		else {
			const filters = {
				where: [],
				clause: [],
			}

			let term = query.name.replace(/\s+/g, ' ').trim()
			filters.where.push('name ilike $1')
			filters.clause.push('%'+term+'%')

			games = await db.select(`
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

		for(let u in games) {
			let item = games[u]

			if(games[u].date)
				games[u].activity = util.displayDate(item.date, 'day month year')

			delete games[u].date
			delete games[u].datetime
		}

		return games
	}
}

module.exports.edit = async (req, res) => {
	let game = await getGame(req.params.gameID)

	if(!game) {
		res.status(404).send('no game found for: ' + req.params.gameID)
		return false
	}

	let data = {
		config: {
			nav: 'games',
			title: game.euid+ ' Edit',
		},
		game
	}
	res.render('admin-games-edit.pug', data)

	async function getGame(playerID) {
		return await db.select(`SELECT * FROM game WHERE id = $1`, [playerID], 'row')
	}
}
