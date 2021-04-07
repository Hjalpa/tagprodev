const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let filters =  {
		where: 'WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND elo >= 2100)',
		// where: 'WHERE gameid in (SELECT id FROM game WHERE gameid = game.id AND elo >= 2000)',
		having: 'HAVING COUNT(*) >= 50'
	}

	let data = {
		nav: 'leaderboards',
		winratio: await getWinRatio(filters),
		pup: await getPups(filters),
		teamcap: await getTeamCapsFor(filters),
		teamcapagainst: await getTeamCapsAgainst(filters),
		cap: await getCaps(filters),
		hold: await getHold(filters),
		returns: await getReturn(filters),
		prevent: await getPrevent(filters),
		tag: await getTag(filters),
		pop: await getPop(filters)
	}

	res.render('leaderboards', data);
}

async function getWinRatio(filters) {
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
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY win_ratio DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getCaps(filters) {
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
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY cap_every ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getTeamCapsFor(filters) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / sum(cap_team_for)) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,
			TO_CHAR(
				(sum(play_time) / sum(cap_team_for)) * interval '1 sec'
			, 'MI:SS') as cap_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY cap_every ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getTeamCapsAgainst(filters) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / sum(cap_team_against)) * interval '1 sec'
					, 'MI:SS') DESC
			) rank,

			player.name as player,
			TO_CHAR(
				(sum(play_time) / sum(cap_team_against)) * interval '1 sec'
			, 'MI:SS') as cap_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY cap_every DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getPups(filters) {
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
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY pup_every ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getPrevent(filters) {
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY sum(prevent) / (sum(play_time) / 60) DESC
			) rank,
			player.name as player,
			-- TO_CHAR( (sum(prevent) / (sum(play_time) / 60)) * interval '1 sec', 'mi:ss') as per_min
			ROUND(sum(prevent) / (sum(play_time) / 60)::numeric, 2) as per_min

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY per_min DESC
		LIMIT 10
	`
	return await db.select(sql, [], 'all')
}

async function getReturn(filters) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / sum(return)) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,
			TO_CHAR(
				(sum(play_time) / sum(return)) * interval '1 sec'
			, 'MI:SS') as return_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY return_every ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getHold(filters) {
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY sum(hold) / (sum(play_time) / 60) DESC
			) rank,
			player.name as player,
			ROUND(sum(hold) / (sum(play_time) / 60)::numeric, 2) as per_min

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY per_min DESC
		LIMIT 10
	`
	return await db.select(sql, [], 'all')
}

async function getTag(filters) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / sum(tag)) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,
			TO_CHAR(
				(sum(play_time) / sum(tag)) * interval '1 sec'
			, 'MI:SS') as tag_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY tag_every ASC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getPop(filters) {
	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / sum(pop)) * interval '1 sec'
					, 'MI:SS') DESC
			) rank,

			player.name as player,
			TO_CHAR(
				(sum(play_time) / sum(pop)) * interval '1 sec'
			, 'MI:SS') as pop_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${filters.where}
		GROUP BY player.name
		${filters.having}
		ORDER BY pop_every DESC
		LIMIT 10
	`, [], 'all')

	return raw
}
