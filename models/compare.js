const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		tab: 'compare',
		players: await getPlayers(),
		// winratio: await longestGame(),
	}
	res.render('compare', data);
}

async function getPlayers() {
	let raw = await db.select(`
		SELECT
			player.name as name,
			count(*) as games
		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND elo > 2000)
		GROUP BY player.name
		HAVING count(*) > 50
		ORDER BY player.name ASC
	`, [], 'all')

	return raw
}

module.exports.data = async (req, res) => await comparePlayers(req, res)
let comparePlayers = async (req, res) => {
	try {
		let where = []

		if(await playerExists(req.body.player1))
			where.push(req.body.player1)

		if(await playerExists(req.body.player2))
			where.push(req.body.player2)

		if(req.body.player1 === req.body.player2)
			throw 'cannot compare ' + req.body.player1 + ' with ' + req.body.player2

		let data = await getComparePlayersData(where)

		res.json(data);
	}
	catch(e) {
		console.log(e)
	}
}

async function playerExists(player) {
	let id = await db.select(`SELECT id from player WHERE name = $1`, [player], 'row')

	if(!id)
		throw 'cannot find player name: ' + player

	return true
}

async function getComparePlayersData(where) {
	let raw = await db.select(`
		SELECT
            player.name as player,
            count(*) as games,
            TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as minutes,

            ROUND(
                (
                    count(*) filter (WHERE result_half_win = 1)
                    /
                    count(*)::DECIMAL
                ) * 100
            , 2) || '%' as winrate,

            ROUND(sum(cap_team_for) / (sum(play_time) / 60)::numeric, 2) * 8 as teamcapfor,
			ROUND(sum(cap_team_against) / (sum(play_time) / 60)::numeric, 2) * 8 as teamcapagainst,

            ROUND(sum(tag) / (sum(play_time) / 60)::numeric, 2) * 8 as tags,
            ROUND(sum(pop) / (sum(play_time) / 60)::numeric, 2) * 8 as pops,
            ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) * 8 as pups,

			TO_CHAR((((sum(play_time) - (sum(hold_team_against) - sum(hold_whilst_opponents_do))) / (sum(play_time) / 60)) * 8) * interval '1 sec', 'MI:SS') as teampossession,

			ROUND((sum(game.elo)::FLOAT / count(*))::numeric , 2) as elo,



			-- attacking
			ROUND((sum(play_time) - (sum(hold_team_against) - sum(hold_whilst_opponents_do))) / (sum(play_time) / 60)::numeric, 2) as flaginbase,
			ROUND(sum(cap) / (sum(play_time) / 60)::numeric, 2) * 8 as caps,
			ROUND(sum(hold) / (sum(play_time) / 60)::numeric, 2) * 8 as hold,
			ROUND(sum(grab) / (sum(play_time) / 60)::numeric, 2) * 8 as grabs,
			ROUND(sum(grab_whilst_opponents_prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as grabwhilstopponentsprevent,
			ROUND(sum(grab_whilst_opponents_hold) / (sum(play_time) / 60)::numeric, 2) * 8 as grabwhilstopponentshold,
			ROUND(sum(drop) / (sum(play_time) / 60)::numeric, 2) * 8 as drops,
            ROUND(sum(drop_within_2_tiles_from_my_base) / (sum(play_time) / 60)::numeric, 2) * 8 as dropwithin2tilesfrommybase,
            ROUND(sum(drop_within_5_tiles_from_my_base) / (sum(play_time) / 60)::numeric, 2) * 8  as dropwithin5tilesfrommybase,

			-- defensive
			ROUND((sum(play_time) - sum(hold_team_against)) / (sum(play_time) / 60)::numeric, 2) * 8 as flaginbase,
            ROUND(sum(prevent) / (sum(play_time) / 60)::numeric, 2) * 10 as prevent,
			ROUND(sum(return) / (sum(play_time) / 60)::numeric, 2) * 10 as returns,
            ROUND(sum(quick_return) / (sum(play_time) / 60)::numeric, 2) * 10 as quickreturns,
            ROUND(sum(key_return) / (sum(play_time) / 60)::numeric, 2) * 10 as keyreturns,
            ROUND(sum(return_within_2_tiles_from_opponents_base) / (sum(play_time) / 60)::numeric, 2) * 10 as returnwithin2tilesfromopponentsbase,
            ROUND(sum(return_within_5_tiles_from_opponents_base) / (sum(play_time) / 60)::numeric, 2) * 10 as returnwithin5tilesfromopponentsbase,

			-- misc
            ROUND(sum(flaccid) / (sum(play_time) / 60)::numeric, 2) * 10 as flaccids


		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		LEFT JOIN game ON game.id = playergame.gameid
		WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND elo > 2000) AND (player.name = $1 OR player.name = $2)
		GROUP BY player.name
	`, where, 'all')

	return raw
}
