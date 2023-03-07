const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		config: {
			title: 'TagPro Super League',
			name: 'Tagpro Super League X',
			path: req.baseUrl,
			nav: {
				cat: req.mode,
				page: 'leaders',
			}
		},
		nav: {
			primary: 'home',
			// secondary: secondary,
		},
	}

	res.render('home', data)
}
