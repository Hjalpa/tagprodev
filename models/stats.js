const exec = require('child_process').exec
const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.leaders = async (req, res) => await leaders(req, res)
let leaders = async (req, res) => {

	let data = {
		scoring: await getScoring(),
		capdiff: await getCapDiff(),
		pupcontrol: await getPupControl(),
		tagpro: await getTagpro(),
		cleansheet: await getCleanSheet(),
	}

	console.log(data)

	res.render('stats', data);
}

async function getScoring() {
	let raw = await db.select(`
		SELECT
			DENSE_RANK() OVER (
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

async function getCapDiff() {
	let raw = await db.select(`
		SELECT
			DENSE_RANK() OVER (
				ORDER BY (sum(playergame.cap_team_for) - sum(playergame.cap_team_against)) / count(*) DESC
			) rank,

			player.name as player,
			sum(playergame.cap_team_for) as cap_for,
			sum(playergame.cap_team_against) as cap_against,
			sum(playergame.cap_team_for) - sum(playergame.cap_team_against) as cap_diff,
			ROUND((sum(cap_team_for) - sum(cap_team_against)) / count(*)::numeric, 2) as per_game

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		GROUP BY player.name
		ORDER BY per_game DESC
		LIMIT 10
	`, [], 'all')

	return raw
}

async function getPupControl() {
	let raw = await db.select(`
		SELECT
			DENSE_RANK() OVER (
				ORDER BY ROUND((sum(pup_tp) + sum(pup_rb) + sum(pup_jj)) / count(*)::numeric, 2) DESC
			) rank,

			player.name as player,

            ROUND(
				(sum(pup_tp)::decimal + sum(pup_rb)::decimal + sum(pup_jj)::decimal)
				/
				(
                	(sum(pup_tp_team_for)::decimal + sum(pup_rb_team_for)::decimal + sum(pup_jj_team_for)::decimal) / 100
				)
            , 2) as my_share,

			(sum(pup_tp_team_for) + sum(pup_rb_team_for) + sum(pup_jj_team_for)) - ( sum(pup_tp_team_against) + sum(pup_rb_team_against) + sum(pup_jj_team_against) ) as plusminus,

			sum(pup_tp) + sum(pup_rb) + sum(pup_jj) as pups,
			ROUND((sum(pup_tp) + sum(pup_rb) + sum(pup_jj)) / count(*)::numeric, 2) as per_game

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
			DENSE_RANK() OVER (
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


async function getCleanSheet() {
	let raw = await db.select(`
		SELECT
			player.name as player,
			count(*) filter (WHERE cap_team_against = 0) as cleansheet,
			count(*) / greatest(count(*) filter (WHERE cap_team_against = 0), 1) as game_per_cleansheet
		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		GROUP BY player.name
		ORDER BY cleansheet DESC
		LIMIT 10
	`, [], 'all')

	return raw
}
