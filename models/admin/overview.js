const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.list = async (req, res) => {
	let data = {
		config: {
			nav: 'overview',
			title: 'Overview'
		},
	}
	res.render('admin-overview.pug', data)
}
