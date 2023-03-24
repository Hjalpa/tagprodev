require('dotenv').config({path:__dirname + '/../.env'})

const axios = require('axios')
const redis = require('redis')
const redisClient = redis.createClient({
    url: process.env.REDIS
})

async function recache(pattern) {
	await redisClient.connect()

	let cursor = '0'
	const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 1000 })
	for (key of reply.keys) {
		cursor = reply.cursor
		await redisClient.del(key)
		console.log('deleted key: ' + cursor)
	}

	await redisClient.disconnect()

	// await axios.get(`https://tagpro.dev/ecltp/9/matches`)
	// await axios.get(`https://tagpro.dev/ecltp/9/league`)
	// await axios.get(`https://tagpro.dev/ecltp/9/teams`)
	// await axios.get(`https://tagpro.dev/ecltp/9/records`)

	// await axios.get(`https://tagpro.dev/ecltp/9/stats`)
	// await axios.get(`https://tagpro.dev/ecltp/9/stats/1`)
	// await axios.get(`https://tagpro.dev/ecltp/9/stats/2`)

	// await axios.get(`https://tagpro.dev/ecltp/9/leaders`)
	// await axios.get(`https://tagpro.dev/ecltp/9/leaders/averages`)
	// await axios.get(`https://tagpro.dev/ecltp/9/leaders/teampercent`)
	// await axios.get(`https://tagpro.dev/ecltp/9/leaders/gamepercent`)
	// await axios.get(`https://tagpro.dev/ecltp/9/leaders/top`)
	// await axios.get(`https://tagpro.dev/ecltp/9/leaders/versus`)
	console.log('cache cleared')
}

init = (() => {})
init.call = async () => {
	try {
		await recache('__express__/*')
	}
	catch(e) {
		console.log(e)
	}
	finally {
		process.kill(process.pid)
	}
}

init.call()
