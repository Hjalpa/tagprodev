const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let user = req.params.userId
		let userid = await playerExists(user)

		let data = {
			title: `${user}'s daily`,
			user: user,
			navtab: 'daily',
			nav: 'player',
			results: await getData(userid),
		}
		res.render('player-day', data);
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

async function getData(player) {

	let raw = await db.select(`
		SELECT
			CONCAT(
				TO_CHAR(DATE_TRUNC('month', date), 'Mon')
				,' ',
				extract(year from date)
			) AS monthyear,
			date_trunc('month', date) as dates,

			count(*) games,
			ROUND((sum(game.elo)::FLOAT / count(*))::numeric , 2) as elo,

			ROUND(sum(tag) / (sum(play_time)::numeric / 60), 2) as tags,
			ROUND(sum(pop) / (sum(play_time)::numeric / 60), 2) as pops,
			ROUND(sum(grab) / (sum(play_time)::numeric / 60), 2) as grabs,
			-- ROUND(sum(drop) / (sum(play_time)::numeric / 60), 2) as drops,
			ROUND(sum(flaccid) / (sum(play_time) / 60)::numeric, 2) as flaccids,
			ROUND(sum(hold) / (sum(play_time)::numeric / 60), 2) as hold,
			ROUND(sum(cap) / (sum(play_time)::numeric / 60), 2) as caps,
			ROUND(sum(prevent) / (sum(play_time)::numeric / 60), 2) as prevent,
			ROUND(sum(playergame.return) / (sum(play_time)::numeric / 60), 2) as returns,
			ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) as pups,

			-- ROUND(sum(hold) / sum(grab)::numeric, 2) as holdpergrab,
			ROUND(
				(
					(ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2))
					/
					(ROUND((sum(pup_tp_team_for)+sum(pup_rb_team_for)+sum(pup_jj_team_for)) / (sum(play_time) / 60)::numeric, 2))
				) * 100
			, 2) || '%' as pup_share

		FROM playergame
		-- LEFT JOIN player on playergame.playerid = player.id
		LEFT JOIN game on game.id = playergame.gameid
		WHERE playerid = $1
		GROUP BY monthyear, dates
		ORDER BY dates DESC
	`, [player], 'all')

	return raw
}
