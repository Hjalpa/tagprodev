const db = require ('../lib/db')
const util = require ('../lib/util')

const matter = require('gray-matter')
const MarkdownIt = require('markdown-it')
const md = new MarkdownIt();

module.exports.init = async (req, res, filename) => await init(req, res, filename)
let init = async (req, res, filename) => {
	try {
		let path = `./pages/${filename}.md`
		let markdown = await matter.read(path)

		let data = {
			config: {
				title: markdown.data.title,
				name:  markdown.data.title,
				path: req.baseUrl,
				nav: {
					cat: 'misc',
				},
			},
			content: md.render(markdown.content)
		}
		res.render('markdown', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}
