const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.list = async (req, res) => {
	res.render('admin-players.pug', {
		config: {
			nav: 'players',
			title: 'Players',
		},
		players: await getPlayers(req.query),
		filters: req.query,
	})

	async function getPlayers(query) {
		const isSearch = query.name && query.name.trim() !== ''
		const term = isSearch ? query.name.replace(/\s+/g, ' ').trim() : null
		const whereClause = isSearch ? 'AND rp.name ILIKE $1' : ''
		const params = isSearch ? [`%${term}%`] : []

		const queryText = `
			WITH RankedPlayers AS (
				SELECT
					p.id,
					p.country,
					p.name,
					ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY g.date DESC) AS rn,
					g.date
				FROM player p
				LEFT JOIN playergame pg ON pg.playerid = p.id
				LEFT JOIN game g ON g.id = pg.gameid
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
			${whereClause}
			ORDER BY rp.id DESC ${isSearch ? ', CHAR_LENGTH(rp.name)' : ''}
			OFFSET 0 ROWS FETCH NEXT 200 ROWS ONLY;
		`

		const players = await db.select(queryText, params, 'all')
		for (const player of players) {
			player.activity = player.date ? util.displayDate(player.date, 'day month year') : '-'
			delete player.date
		}

		return players
	}
}

module.exports.edit = async (req, res) => {
	let user = {}

	if(req.params.playerID != 'new') {
		user = await getUser(req.params.playerID)
		if(!user) {
			res.status(404).send('no user found for: ' + req.params.playerID)
			return false
		}
	}

	let data = {
		config: {
			nav: 'players',
			title: user.name + ' edit',
		},
		user
	}
	res.render('admin-players-edit.pug', data)

	async function getUser(playerID) {
		return await db.select(`SELECT * FROM player WHERE id = $1`, [playerID], 'row')
	}
}

module.exports.save = async (req, res) => {
	let data = {
		id: parseInt(req.body.playerid),
		name: req.body.name,
		region: await getRegion(req.body.region),
		country: req.body.country,
		tpid: req.body.tpid,
	}

	if (data.id == null || isNaN(data.id))
		delete data.id

	await db.insertUpdate('player', data, ['id'])

	res.json({'success': true})

	async function getRegion(regionName) {
		return await db.select(`SELECT id FROM region WHERE name = $1`, [regionName], 'id')
	}
}

module.exports.delete = async (req, res) => {
	const playerID = parseInt(req.params.playerid)

	let hasGames = await db.select(`SELECT * FROM PlayerGame WHERE PlayerID = $1`, [playerID], 'all')
	if(hasGames)
		throw 'cannot delete. player has games'

	console.log('delete', req.params)
	res.json({'succcess':true})
}
