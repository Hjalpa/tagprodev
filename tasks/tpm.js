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
	process.kill(process.pid)
}

tpm.call()
