const db = require ('../../lib/db')
const { rating, rate, ordinal } = require('openskill')
const routeCache = require('route-cache')

module.exports.decay = async (req, res) => {
	console.clear()

	try {
		console.log('.... start decay ........')

		const decayRate = 0.01
		const timeElapsed = 1 // time elapsed in days. Decay logic
		const daysAgo = 7 // players that haven't played in this amount of days will return from the SQL

		// select the top 50 players that haven't played in daysAgo amount
		let players = await db.select(`
			SELECT xpg.id, p.name, xpg.mu, xpg.sigma, xpg.openskill
			FROM tp_playergame
			LEFT JOIN tp_player as p ON p.id = tp_playergame.playerid
			LEFT JOIN tp_playergame as xpg ON p.id = xpg.playerid AND xpg.datetime = (
				SELECT MAX(datetime)
				FROM tp_playergame
				WHERE playerid = p.id
			)
			WHERE p.tpid is not null AND xpg.openskill is not null AND EXTRACT(DAY FROM (CURRENT_DATE - xpg.datetime)) > ${daysAgo}
			GROUP BY p.id, tp_playergame.playerid, xpg.openskill, xpg.mu, xpg.sigma, p.name, xpg.id
			ORDER BY xpg.openskill desc
			LIMIT 50
		`, [], 'all')

		let data = []
		for(let p of players) {
			const { mu: decayedMu, sigma: decayedSigma } = applyDecay(p.mu, p.sigma, decayRate, timeElapsed)
			const decayedOpenskill = ordinal({mu: decayedMu, sigma: decayedSigma})

			// this data array is used for debugging to the console.table
			data.push({
				name: p.name,
				mu: p.mu.toFixed(2),
				oldSigma: p.sigma.toFixed(2),
				newSigma: decayedSigma.toFixed(2),
				decayedSigmaAmount: (p.sigma - decayedSigma).toFixed(2),
				oldOpenskill: p.openskill.toFixed(2),
				newOpenskill: decayedOpenskill.toFixed(2),
				decayedOpenskill: (p.openskill - decayedOpenskill).toFixed(2),
			})

			// await db.update('tp_playergame', {mu: decayedMu, sigma: decayedSigma, openskill: decayedOpenskill}, {id: p.id})
		}

		console.table(data)
	}
	catch(e) {
		res.json({success:false,error: e})
	}

	finally {
		console.log('.... end decay ..........')
		routeCache.clearCache()
		res.json({success:true})
	}
}

function applyDecay(mu, sigma, decayRate, time) {
	const newSigma = sigma * Math.exp(decayRate * time)
    return { mu, sigma: newSigma }
}
