const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		tab: 'leaderboards',

		winratio: await getWinRatio(),
		pup: await getPups(),
		cap: await getCaps(),
		prevent: await getPrevent(),

		flaginbase: await getFlagInBase(),
		cleansheet: await getCleansheet(),
		mercy: await getMercy(),





		capdiff: await getCapDiff(),

		scoring: await getScoring(),
		tagpro: await getTagpro(),
	}

	res.render('leaderboards', data);
}

async function getWinRatio() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
				(count(*) filter (WHERE result_half_win = 1) / count(*)::DECIMAL) * 100 DESC
			) rank,

			player.name as player,
			ROUND(
				(
					count(*) filter (WHERE result_half_win = 1)
					/
					count(*)::DECIMAL
				) * 100
			, 2) || '%' as win_ratio

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		GROUP BY player.name
		HAVING COUNT(*) > 50
		ORDER BY win_ratio DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getCaps() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / sum(cap)) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,
			TO_CHAR(
				(sum(play_time) / sum(cap)) * interval '1 sec'
			, 'MI:SS') as cap_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		GROUP BY player.name
		HAVING COUNT(*) > 50
		ORDER BY cap_every ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getPups() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / (sum(pup_jj)+sum(pup_rb)+sum(pup_tp))) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,
			TO_CHAR(
				(sum(play_time) / (sum(pup_tp)+sum(pup_rb)+sum(pup_jj))) * interval '1 sec'
			, 'MI:SS') as pup_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		GROUP BY player.name
		HAVING COUNT(*) > 50
		ORDER BY pup_every ASC
		LIMIT 10
	`, [], 'all')

	return raw
}


async function getPrevent() {
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY sum(prevent) / (sum(play_time) / 60) DESC
			) rank,
			player.name as player,
			TO_CHAR( (sum(prevent) / (sum(play_time) / 60)) * interval '1 sec', 'mi:ss') as per_min

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		GROUP BY player.name
		HAVING COUNT(*) > 50
		ORDER BY per_min DESC
		LIMIT 10
	`
	return await db.select(sql, [], 'all')
}






async function getCapDiff() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY ROUND((sum(cap_team_for) - sum(cap_team_against)) / count(*)::numeric, 2) DESC
			) rank,

			player.name as player,
			sum(playergame.cap_team_for) as cap_for,
			sum(playergame.cap_team_against) as cap_against,
			sum(playergame.cap_team_for) - sum(playergame.cap_team_against) as cap_diff,

			TO_CHAR(
				(sum(play_time) / (sum(cap_team_for) - sum(cap_team_against))) * interval '1 sec'
			, 'MI:SS') as cap_every,
			(sum(play_time) / (sum(cap_team_for) - sum(cap_team_against))) as cap_every_raw

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		GROUP BY player.name
		HAVING
			COUNT(*) > 50
				AND
			sum(playergame.cap_team_for) - sum(playergame.cap_team_against) > 0
		ORDER BY cap_every_raw ASC
		LIMIT 10
	`, [], 'all')

	console.log(raw)
	return raw
}

async function getScoring() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY (sum(playergame.cap) + sum(playergame.assist)) / count(*) DESC
			) rank,

			player.name as player,
			sum(playergame.assist) as assist,
			sum(playergame.cap) as cap,
			sum(playergame.cap) + sum(playergame.assist) as combined,
			(sum(playergame.cap) + sum(playergame.assist)) / count(*) as per_game

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		GROUP BY player.name
		ORDER BY per_game DESC
		LIMIT 10
	`, [], 'all')

	return raw
}


async function getTagpro() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY ROUND((sum(pup_tp)) / count(*)::numeric, 2) DESC
			) rank,

			player.name as player,

            ROUND(
				(sum(pup_tp)::decimal)
				/
				(
                	sum(pup_tp_team_for)::decimal / 100
				)
            , 2) as my_share,

			sum(pup_tp_team_for) - sum(pup_tp_team_against) as plusminus,

			sum(pup_tp) as pups,
			ROUND(sum(pup_tp) / count(*)::numeric, 2) as per_game

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		GROUP BY player.name
		ORDER BY per_game DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getCleansheet() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY count(*) filter (WHERE cap_team_against = 0) DESC
			) rank,
			player.name as player,
			count(*) filter (WHERE cap_team_against = 0) as cleansheet
		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		GROUP BY player.name
		HAVING COUNT(*) > 50
		ORDER BY cleansheet DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getMercy() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY count(*) filter (WHERE cap_team_against = 0) DESC
			) rank,
			player.name as player,
			count(*) filter (WHERE cap_team_against = 0 AND (cap_team_for - cap_team_against = 5)) as mercy

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		GROUP BY player.name
		HAVING COUNT(*) > 50
		ORDER BY mercy DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getFlagInBase() {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY (sum(play_time) - (sum(hold_team_against) - sum(hold_whilst_opponents_do))) / (sum(play_time) / 60) DESC
			) rank,

			player.name as player,
			TO_CHAR(
				(sum(play_time) - (sum(hold_team_against) - sum(hold_whilst_opponents_do))) / (sum(play_time) / 60) * interval '1 sec'
				, 'MI:SS'
			) as per_min

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
        WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND game.seasonid = 1)
		GROUP BY player.name
		HAVING COUNT(*) > 50
		ORDER BY per_min DESC
		LIMIT 10
	`, [], 'all')

	return raw
}
