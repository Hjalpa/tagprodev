process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const db = require('../lib/db')
const util = require('../lib/util')

tpm = (() => {})
tpm.call = async () => {
	const tpmid = process.argv[2]
	if(tpmid) {
		let raw = await axios.get(`https://tpm.gg/eus/${tpmid}`)
		let data = raw.data.match(/[^,]+,[^,]+/g);
		for await (const x of data) {
			let tmp = x.split(',')
			if(tmp[0] === '2965680') continue
			if(tmp[0] === '2965656') continue
			if(tmp[0] === '2965732') continue
			if(tmp[0] === '2967327') continue
			let gameExists = await db.select('SELECT id FROM game WHERE euid = $1', [tmp[0]], 'id')
			if(!gameExists) {
				await axios.post(`https://tagpro.dev/api/import`, {
					euid: tmp[0],
					elo: tmp[1],
					tpmid: tpmid
				})
				console.log('added ' + tmp[0])
			}
		}
	}
	await axios.get(`https://tagpro.dev`)
	await axios.get(`https://tagpro.dev/?season=3`)
	await axios.get(`https://tagpro.dev/?season=2`)
	await axios.get(`https://tagpro.dev/records`)
	await axios.get(`https://tagpro.dev/records?season=3`)
	await axios.get(`https://tagpro.dev/records?season=2`)
	await axios.get(`https://tagpro.dev/records?elo=low`)
	await axios.get(`https://tagpro.dev/records?season=3&elo=low`)
	await axios.get(`https://tagpro.dev/records?season=2&elo=low`)
	process.kill(process.pid)
}

tpm.call()
