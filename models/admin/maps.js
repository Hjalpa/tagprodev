const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.list = async (req, res) => {
	let data = {
		config: {
			nav: 'maps',
			title: 'Maps',
		},
		maps: await getMaps(req.query),
		filters: req.query,
	}
	res.render('admin-maps.pug', data)

	async function getMaps(query) {
		let maps = {}

		if (!('name' in req.query) || req.query.name === '')
			maps = await db.select(`
				WITH TPMaps AS (
					SELECT
						m.id,
						m.name,
						ROW_NUMBER() OVER (PARTITION BY m.id ORDER BY g.date DESC) AS rn,
						g.date
					FROM map m
					INNER JOIN game g ON g.mapid = m.id
				)
				SELECT
					rp.id,
					rp.name,
					(SELECT COUNT(*) FROM game WHERE mapid = rp.id) AS games,
					rp.date
				FROM TPMaps rp
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

			maps= await db.select(`
				WITH TPMaps AS (
					SELECT
						m.id,
						m.name,
						ROW_NUMBER() OVER (PARTITION BY m.id ORDER BY g.date DESC) AS rn,
						g.date
					FROM map m
					INNER JOIN game g ON g.mapid = m.id
				)
				SELECT
					rp.id,
					rp.name,
					(SELECT COUNT(*) FROM game WHERE mapid = rp.id) AS games,
					rp.date
				FROM TPMaps rp
				WHERE rp.rn = 1
					AND
					${filters.where.join(' OR ')}
				ORDER BY rp.date DESC, CHAR_LENGTH(name)
				OFFSET 0 ROWS FETCH NEXT 200 ROWS ONLY;
			`, filters.clause, 'all')
		}

		for(let u in maps) {
			let item = maps[u]

			if(maps[u].date)
				maps[u].activity = util.displayDate(item.date, 'day month year')

			delete maps[u].date
		}

		return maps
	}
}

module.exports.edit = async (req, res) => {
	let map = await getMaps(req.params.mapID)

	if(!map) {
		res.status(404).send('no user found for: ' + req.params.mapID)
		return false
	}

	let data = {
		config: {
			nav: 'maps',
			title: map.name + ' Edit',
		},
		map
	}
	res.render('admin-maps-edit.pug', data)

	async function getMaps(mapID) {
		return await db.select(`SELECT * FROM map WHERE id = $1`, [mapID], 'row')
	}
}
