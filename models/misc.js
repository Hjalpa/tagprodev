const db = require ('../lib/db')
const util = require ('../lib/util')
const mvb = require ('../lib/mvb')

module.exports.rules = async (req, res) => await rules(req, res)
let rules = async (req, res) => {
	try {
		let data = {
			config: {
				title: 'Super League Rules',
				name:  'Super League Rules',
				path: req.baseUrl,
				nav: {
					cat: 'misc',
				},
				content: `
					asd
					asd
					asd
				`

			}
		}
		res.render('markdown', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

module.exports.faq = async (req, res) => await faq(req, res)
let faq = async (req, res) => {
	try {
		let data = {
			config: {
				title:  'Frequently Asked Questions',
				name:  'Frequently Asked Questions',
				path: req.baseUrl,
				nav: {
					cat: 'misc',
				}
			},
			content: `
				asd
				asd
				asd
			`
		}
		res.render('markdown', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}
