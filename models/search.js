const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			title: 'Player Search',
			nav: 'search',
			results: await getSearchData(req.params.player)
		}
		res.render('search', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getSearchData(player) {
	let sql = `
		SELECT
			id,
			name as player
		FROM player
		WHERE name ILIKE $1
	`
	return await db.select(sql, ['%'+player+'%'], 'all')
}
