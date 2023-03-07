const axios = require('axios')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: 'Rolling 300',
				name:  'rc300',
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: 'r300',
					page: 'overview'
				}
			},
			players: await getPlayers(),
		}
		res.render('players', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getPlayers() {

	let players = {
		'BartimaeusJr': '5494d03768393efe1352e7d7',
		// 'xcv': '52f2a5f1bf26b8391d551652',
		// 'SoulCake': '58cb1d0de448bd946a07e082',
		// 'Jiminy': '536fa36611dbe71417e96988',
		// 'Sea.': '52e6d282d1a6991e2a000413',
		// '!': '5372594f11dbe71417e969d5',
		// 'Booya Ball': '54a5811fd92c71e671943433',
		// 'Jim Jimson': '5321f6a4d83bced06424a31e',
		// 'Gvendolino': '5658d3e35f95ee3e02180981',
		// 'Pingu': '55dc8a031db8507c47e13b08',
		// 'sweatypete': '56bbb5383181aaf406316dd6',
		// '.void': '5346784c7e7269a515e60093',
	}

	for(const name in players) {
		let url = 'https://tagpro.koalabeast.com/profiles/' + players[name]
		let raw = await axios.get(url, { headers: { 'User-Agent': 'Firefox/5.0' }  } )
		// let data = JSON.parse(raw)
		console.log(raw)
	}

	return raw
}
