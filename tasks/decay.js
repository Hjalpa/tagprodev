const { rating, rate, ordinal } = require('openskill')

async function init() {
		console.log('.... start decay ........')

		const decayRate = 0.01
		const timeElapsed = 1 // time elapsed in days. Decay logic
		const daysAgo = 7 // players that haven't played in this amount of days will return from the SQL

		// select the top 50 players that haven't played in daysAgo amount
		let players = await db.select(`
			SELECT xpg.mu, xpg.sigma, xpg.openskill
			FROM tp_playergame
			LEFT JOIN tp_player as p ON p.id = tp_playergame.playerid
			LEFT JOIN tp_playergame as xpg ON p.id = xpg.playerid AND xpg.datetime = (
				SELECT MAX(datetime)
				FROM tp_playergame
				WHERE playerid = p.id
			)
			WHERE p.tpid is not null AND xpg.openskill is not null AND EXTRACT(DAY FROM (CURRENT_DATE - xpg.datetime)) > ${daysAgo}
			GROUP BY p.id, tp_playergame.playerid, xpg.openskill
			ORDER BY xpg.openskill desc
			LIMIT 50
		`, [], 'all')


		for(let p in players) {
			const initialMu = p.mu
			const initialSigma = p.sigma
			const { mu: decayedMu, sigma: decayedSigma } = applyDecay(initialMu, initialSigma, decayRate, timeElapsed)

			console.log(`Decayed Mu: ${decayedMu.toFixed(2)}`)
			console.log(`Decayed Sigma: ${decayedSigma.toFixed(2)}`)

			// await db.update('tp_playergame', '')
		}
}



init()
