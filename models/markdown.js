const matter = require('gray-matter')
const MarkdownIt = require('markdown-it')
const md = new MarkdownIt({html:true})

module.exports.init = async (req, res, filename) => {
	try {
		let markdown = await matter.read(`./pages/${filename}.md`)
		let data = {
			config: {
				title: markdown.data.title,
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
