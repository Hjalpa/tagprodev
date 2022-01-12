const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		title: 'Table',
		nav: {
			primary: 'superleague',
			secondary: 'stats',
			tertiary: 'totals',
		},
		table: await getTable()
	}



	res.render('superleague-stats', data)

}

async function getTable() {

}
