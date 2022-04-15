const db = require ('../lib/db')
const util = require ('../lib/util')
const mvb = require ('../lib/mvb')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: 'Super League Rules',
				name:  'Super League Rules',
				path: req.baseUrl,
				nav: {
					cat: 'rules',
				}
			}
		}
		res.render('misc', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}
