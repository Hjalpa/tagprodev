const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		nav: 'compare',
		players: await getPlayers(),
	}
	res.render('compare', data);
}

async function getPlayers() {
	let raw = await db.select(`
		SELECT
			player.name as name,
			count(*) as games,
			season.number as seasonid
		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		LEFT JOIN game on playergame.gameid = game.id
		LEFT JOIN season on game.seasonid = season.id
		WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND elo > 2000)
		GROUP BY player.name, season.number
		HAVING count(*) > 20
		ORDER BY player.name ASC, seasonid ASC
	`, [], 'all')

	// let raw = await db.select(`
	// 	SELECT
	// 		player.name as name,
	// 		count(*) as games
	// 	FROM playergame
	// 	LEFT JOIN player ON player.id = playergame.playerid
	// 	WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND elo > 2000)
	// 	GROUP BY player.name
	// 	HAVING count(*) > 20
	// 	ORDER BY player.name ASC
	// `, [], 'all')

	return raw
}

module.exports.data = async (req, res) => await comparePlayers(req, res)
let comparePlayers = async (req, res) => {
	try {
		let filter = { where: [], data: [] }
		let num = 1
		for (let k in req.body) {
			if(await playerExists(req.body[k])) {
				filter.where.push('player.name = $'+num)
				filter.data.push(req.body[k])
				num++
			}
		}

		if(filter.data.length <= 1)
			throw 'cannot compare less than 1 player'

		let data = await getComparePlayersData(filter)

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

async function getComparePlayersData(filter) {
	let raw = await db.select(`
		SELECT
            player.name as player,

			-- overview
			count(*) as games,
			ROUND((sum(game.elo)::FLOAT / count(*))::numeric , 2) as elo,
			TO_CHAR( sum(play_time) * interval '1 sec', 'hh24:mi:ss') as time,
            ROUND(
                (
                    count(*) filter (WHERE result_half_win = 1)
                    /
                    count(*)::DECIMAL
                ) * 100
            , 2) || '%' as winrate,
            ROUND(
                (
                    count(*) filter (WHERE result_half_win = 1 AND play_time > 480)
                    /
					count(*) filter (WHERE play_time > 480)::DECIMAL
                ) * 100
            , 2) || '%' as overtimewinrate,

            ROUND(
                (
                    count(*) filter (WHERE cap_team_for - cap_team_against = 5)
                    /
					count(*)::DECIMAL
                ) * 100
            , 2) || '%' as mercywinrate,


			-- whats this?
			-- count(*) filter (WHERE (cap_team_for - cap_team_against = 5)) as mercies,
			-- count(*) filter (WHERE cap_team_against = 0) as cleansheets,
			-- count(*) filter (WHERE play_time > 480) as overtimes,

			-- offense
			ROUND(sum(cap) / (sum(play_time) / 60)::numeric, 2) * 8 as caps,
			ROUND(sum(cap_from_prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as capfromteamprevent,

			ROUND(sum(hold) / (sum(play_time) / 60)::numeric, 2) * 8 as hold,
			ROUND(sum(hold) / sum(grab)::numeric, 2) as holdpergrab,
			TO_CHAR(
				ROUND(sum(hold) / sum(cap)::numeric, 2)
				* interval '1 sec'
			, 'MI:SS') as holdpercap,
			ROUND(sum(hold_whilst_opponents_dont) / (sum(play_time) / 60)::numeric, 2) * 8 as holdwhilstopponentsdont,
			ROUND(sum(hold_whilst_team_prevent_time) / (sum(play_time) / 60)::numeric, 2) * 8 as holdwhilstteamprevent,
			ROUND(sum(long_hold) / (sum(play_time) / 60)::numeric, 2) * 8 as longhold,
			TO_CHAR(
				(sum(play_time) / greatest(sum(long_hold), 1)) * interval '1 sec'
			, 'MI:SS') as longholdevery,
            ROUND(
                (
                    sum(long_hold_and_cap)::numeric
                    /
					sum(long_hold)::numeric
                ) * 100
            , 2) || '%' as longholdcaprate,

			ROUND((sum(handoff_drop) + sum(handoff_pickup)) / (sum(play_time) / 60)::numeric, 2) * 8 as handoffs,
			ROUND(sum(handoff_drop) / (sum(play_time) / 60)::numeric, 2) * 8 as handoffdrops,
			ROUND(sum(handoff_pickup) / (sum(play_time) / 60)::numeric, 2) *8 as handoffpickups,

			ROUND(sum(grab) / (sum(play_time) / 60)::numeric, 2) * 8 as grabs,
			ROUND(sum(grab) / sum(cap)::numeric, 2) as grabspercap,
			ROUND(sum(grab_whilst_opponents_prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as grabswhilstopponentsprevent,
			ROUND(sum(grab_whilst_opponents_hold) / (sum(play_time) / 60)::numeric, 2) * 8 as grabswhilstopponentshold,
			ROUND(sum(grab_whilst_opponents_hold_long) / (sum(play_time) / 60)::numeric, 2) * 8 as grabswhilstopponentsholdlong,

			ROUND(sum(drop) / (sum(play_time) / 60)::numeric, 2) * 8 as drops,
			ROUND(sum(flaccid) / (sum(play_time) / 60)::numeric, 2) * 8 as flaccids,
            ROUND(sum(drop_within_2_tiles_from_my_base) / (sum(play_time) / 60)::numeric, 2) * 8 as dropwithin2tilesfrommybase,
            ROUND(sum(drop_within_5_tiles_from_my_base) / (sum(play_time) / 60)::numeric, 2) * 8 as dropwithin5tilesfrommybase,
			ROUND(
                (
					sum(drop_within_my_half)::numeric
                    /
					sum(drop)::numeric
                ) * 100
            , 2) || '%' as dropwithinmyhalf,




			-- defense
            ROUND(
                (
                    (sum(play_time)::numeric - sum(hold_team_against))::numeric
                    /
					sum(play_time)::numeric
                ) * 100
            , 2) || '%' as flaginbase,
            ROUND(sum(cap_team_against) / (sum(play_time) / 60)::numeric, 2) * 8 as concedes,
            ROUND(sum(prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as prevent,
			ROUND(sum(prevent) / sum(return)::numeric, 2) as preventperreturn,
			ROUND(sum(prevent_whilst_team_hold_time) / (sum(play_time) / 60)::numeric, 2) * 8 as preventwhilstteamhold,
			ROUND(sum(cap_from_my_prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as capfrommyprevent,
			ROUND(sum(opponents_grab_whilst_my_prevent) / (sum(play_time) / 60)::numeric, 2) * 8 as opponentsgrabwhilstmyprevent,

			ROUND(sum(return) / (sum(play_time) / 60)::numeric, 2) * 8 as returns,
            ROUND(sum(quick_return) / (sum(play_time) / 60)::numeric, 2) * 8 as quickreturns,
            ROUND(sum(key_return) / (sum(play_time) / 60)::numeric, 2) * 8 as keyreturns,
			ROUND(
                (
					sum(return_within_my_half)::numeric
                    /
					sum(return)::numeric
                ) * 100
            , 2) || '%' as returnwithinmyhalf,
			ROUND((sum(reset_from_my_return) + sum(reset_from_my_prevent)) / (sum(play_time) / 60)::numeric, 2) * 8 as resets,
			ROUND(sum(reset_from_my_return) / (sum(play_time) / 60)::numeric, 2) * 8 as resetfrommyreturn,
			ROUND(sum(reset_from_my_prevent) / (sum(play_time) / 60)::numeric, 2) *8 as returnfrommyprevent,


			-- offense defense
			ROUND(sum(kiss) / (sum(play_time) / 60)::numeric, 2) * 10 as kisses,
            ROUND(
                (
                    sum(good_kiss)::numeric
                    /
					sum(kiss)::numeric
                ) * 100
            , 2) || '%' as goodkissrate,
            ROUND(sum(return_within_5_tiles_from_opponents_base) / (sum(play_time) / 60)::numeric, 2) * 8 as saves,




			-- summary
            ROUND(sum(tag) / (sum(play_time) / 60)::numeric, 2) * 8 as tags,
            ROUND(sum(pop) / (sum(play_time) / 60)::numeric, 2) * 8 as pops,

			-- powerups
            ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) * 7 as pups,
            ROUND(sum(pup_tp) / (sum(play_time) / 60)::numeric, 2) * 7 as tagpros,
			ROUND(
				(
					(sum(pup_tp_team_for)+sum(pup_tp_team_against))::FLOAT
					/
					(sum(pup_tp_team_for)+sum(pup_tp_team_against)+sum(pup_jj_team_for)+sum(pup_jj_team_against)+sum(pup_rb_team_for)+sum(pup_rb_team_against))::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as tagprospawnchance,

			ROUND((sum(pup_tp_team_for)+sum(pup_rb_team_for)+sum(pup_jj_team_for)) / (sum(play_time) / 60)::numeric, 2) * 7 as teampups,
			ROUND(
				(
					(ROUND((sum(pup_tp)+sum(pup_rb)+sum(pup_jj)) / (sum(play_time) / 60)::numeric, 2) * 7)
					/
					(ROUND((sum(pup_tp_team_for)+sum(pup_rb_team_for)+sum(pup_jj_team_for)) / (sum(play_time) / 60)::numeric, 2) * 7)
				) * 100
			, 2) || '%' as mysharepups,
		ROUND(
				(
					(sum(pup_tp_team_for)+sum(pup_rb_team_for)+sum(pup_jj_team_for))
					-
					(sum(pup_tp_team_against)+sum(pup_rb_team_against)+sum(pup_jj_team_against))
				)::NUMERIC
				/
				(
					(
						(sum(pup_tp_team_for)+sum(pup_rb_team_for)+sum(pup_jj_team_for))
						+
						(sum(pup_tp_team_against)+sum(pup_rb_team_against)+sum(pup_jj_team_against))
					) / 2
				)::NUMERIC * 100
			, 2) || '%' as teampupdiff


		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		LEFT JOIN game ON game.id = playergame.gameid

		-- see by season
		-- LEFT JOIN season ON game.seasonid = season.id
		-- WHERE gameid in (SELECT id FROM game WHERE season.number = 3 AND  gameid = game.id AND elo > 2000) AND (${filter.where.join(' OR ')})

		WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND elo > 2000) AND (${filter.where.join(' OR ')})
		GROUP BY player.name
		HAVING count(*) > 20
	`, filter.data, 'all')

	return raw
}
