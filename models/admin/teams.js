const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.list = async (req, res) => {
	let data = {
		config: {
			nav: 'teams',
			title: 'Teams',
		},
		teams: await getTeams(req.query),
		filters: req.query,
	}
	res.render('admin-teams.pug', data)

	async function getTeams(query) {
		let teams = {}

		if (!('name' in req.query) || req.query.name === '')
			teams = await db.select(`
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

			teams = await db.select(`
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

		for(let u in teams) {
			let item = teams[u]

			if(teams[u].date)
				teams[u].activity = util.displayDate(item.date, 'day month year')

			delete teams[u].date
		}

		return teams
	}
}

module.exports.edit = async (req, res) => {
	let map = await getTeams(req.params.teamID)

	if(!map) {
		res.status(404).send('no user found for: ' + req.params.teamID)
		return false
	}

	let data = {
		config: {
			nav: 'teams',
			title: map.name + ' Edit',
		},
		map
	}
	res.render('admin-teams-edit.pug', data)

	async function getTeams(teamID) {
		return await db.select(`SELECT * FROM map WHERE id = $1`, [teamID], 'row')
	}
}
