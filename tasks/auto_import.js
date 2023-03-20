process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const jsdom = require('jsdom')

const db = require('../lib/db')
const util = require('../lib/util')

init= (() => {})
init.call = async () => {

	let teamnames = await db.select(`
		SELECT
			team.acronym
		FROM seasonteam
		LEFT JOIN team on team.id = seasonteam.teamid
		WHERE seasonid = $1`,
		[11], 'all')

	for await (let name of teamnames) {

		console.log('searching '+name.acronym+' games')
		let raw = await axios.get(`https://tagpro.eu/?search=team-official&name=` + name.acronym)

		raw.headers['content-type']
		const dom = new jsdom.JSDOM(raw.data)
		const trs = dom.window.document.querySelectorAll('.matches tbody tr')

		for await (const tr of trs) {

			let data = {
				euid: parseInt(tr.querySelector('td:first-child a').textContent.substring(1)),
				map: tr.querySelector('.mapname a').textContent,
				red: tr.querySelector('.matches-team1').textContent,
				blue: tr.querySelector('.matches-team2').textContent
			}

			let game = await db.select(`
				SELECT
					seasonschedule.*,

					rt.acronym as red_acronym,
					bt.acronym as blue_acronym,
					map.name

				FROM seasonschedule

				LEFT JOIN seasonteam bst ON bst.id = teamblueid
				LEFT JOIN team bt ON bt.id = bst.teamid

				LEFT JOIN seasonteam rst ON rst.id = teamredid
				LEFT JOIN team rt ON rt.id = rst.teamid

				LEFT JOIN map ON map.id = seasonschedule.mapid

				WHERE seasonschedule.seasonid = 11 AND map.name = $1 AND rt.acronym = $2 AND bt.acronym = $3 AND gameid IS NULL AND seasonschedule.date = '2023-03-19'

				LIMIT 1
			`, [data.map, data.red, data.blue], 'row')

			if(game) {
				let euid = data.euid
				if(euid) {
					let gameExists = await db.select('SELECT id FROM game WHERE euid = $1', [euid], 'id')
					if(!gameExists) {
						await axios.post(`http://localhost/api/import`, {
							euid: euid,
							seasonid: 11 // adjust this for new seasons and create db entry within season table
						})
						console.log('imported:' + euid)
					}

					// grab game id
					let gameID = await db.select('SELECT id FROM game WHERE euid = $1', [euid], 'id')
					console.log('found match: game id ' + gameID + ' and euid: ' + euid)

					// insert game id into seasonschedule
					if(gameID) {
						await db.update('seasonschedule', {gameid: gameID}, {id: game.id})
						console.log('seasonschedule match updated')
					}
					console.log('...........................')
				}
			}
		}

	}

	// await axios.get(`https://tagpro.dev/ctf/1/`)
	// await axios.get(`https://tagpro.dev/ctf/1/stats`)
	// await axios.get(`https://tagpro.dev/ctf/1/stats/1`)
	// await axios.get(`https://tagpro.dev/ctf/1/stats/2`)
	// await axios.get(`https://tagpro.dev/ctf/1/stats/4`)
	// await axios.get(`https://tagpro.dev/ctf/1/stats/4`)
	// await axios.get(`https://tagpro.dev/ctf/1/stats/5`)
	// await axios.get(`https://tagpro.dev/ctf/1/leaders`)
	// await axios.get(`https://tagpro.dev/ctf/1/records`)
	// await axios.get(`https://tagpro.dev/ctf/1/matches`)

	process.kill(process.pid)
}

init.call()
