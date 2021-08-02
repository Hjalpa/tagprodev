const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let user = req.params.userId
		let userid = await playerExists(user)

		let data = {
			title: `${user}'s breakdown`,
			user: user,
			navtab: 'breakdown',
			nav: 'player',
			monthwonlost: await getMonthWonLost(userid),
			daywonlost: await getDayWonLost(userid),
			hourwonlost: await getHourWonLost(userid),
			elowonlost: await getEloWonLost(userid)
		}
		res.render('player-breakdown', data);
	}
	catch(e) {
		res.status(400).json({error: e})
	}
}

async function playerExists(player) {
	let id = await db.select(`SELECT id from player WHERE name = $1`, [player], 'id')

	if(!id)
		throw 'cannot find player name: ' + player

	return id
}

async function getHourWonLost(player) {
	// fake hour is used for the ordering
	let raw = await db.select(`
		SELECT
            TO_CHAR(DATE_TRUNC('hour', datetime), 'hh24 AM') as fake_hour,
            TO_CHAR(DATE_TRUNC('hour', datetime), 'AM') as am,
            TO_CHAR(DATE_TRUNC('hour', datetime), 'hh AM') as hour,

			(
				count(*) filter (WHERE result_half_win = 1)
				/
				count(*)::DECIMAL
			) * 100 as won,
			(
				count(*) filter (WHERE result_half_win != 1)
				/
				count(*)::DECIMAL
			) * 100 as lost,
			count(*)::DECIMAL as games

		from playergame
		left join game ON game.id = playergame.gameid
		where playerid = $1
		GROUP by fake_hour, am, hour
		ORDER BY am DESC, fake_hour ASC
	`, [player], 'all')

	return raw
}

async function getEloWonLost(player) {
	let raw = await db.select(`
		SELECT
		    CAST(ROUND(elo / 250) * 250 as integer) as eloband,
			(
				count(*) filter (WHERE result_half_win = 1)
				/
				count(*)::DECIMAL
			) * 100 as won,
			(
				count(*) filter (WHERE result_half_win != 1)
				/
				count(*)::DECIMAL
			) * 100 as lost,
			count(*)::DECIMAL as games

		from playergame
		left join game ON game.id = playergame.gameid
		where playerid = $1
		GROUP BY eloband
		ORDER BY eloband ASC
	`, [player], 'all')

	return raw
}

async function getDayWonLost(player) {
	let raw = await db.select(`
		SELECT
			TO_CHAR(DATE_TRUNC('hour', datetime), 'Dy') as day,
			TO_CHAR(DATE_TRUNC('hour', datetime), 'D') as day_order,
			(
				count(*) filter (WHERE result_half_win = 1)
				/
				count(*)::DECIMAL
			) * 100 as won,
			(
				count(*) filter (WHERE result_half_win != 1)
				/
				count(*)::DECIMAL
			) * 100 as lost,
			count(*)::DECIMAL as games

		from playergame
		left join game ON game.id = playergame.gameid
		where playerid = $1
		GROUP BY day, day_order
		ORDER BY day_order
	`, [player], 'all')

	return raw
}

async function getMonthWonLost(player) {


	let raw = await db.select(`
		SELECT
			CONCAT(
				TO_CHAR(DATE_TRUNC('month', date), 'Mon')
				,' ',
				extract(year from date)
			) AS monthyear,
			date_trunc('month', date) as dates,

			(
				count(*) filter (WHERE result_half_win = 1)
				/
				count(*)::DECIMAL
			) * 100 as won,

			(
				count(*) filter (WHERE result_half_win != 1)
				/
				count(*)::DECIMAL
			) * 100 as lost

		from playergame
		left join game ON game.id = playergame.gameid
		where playerid = $1
		GROUP by monthyear, dates
		ORDER BY dates DESC
		LIMIT 10
	`, [player], 'all')

	return raw
}
