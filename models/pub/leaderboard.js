const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => {
	try {
		let day = await getData('day')
		let week = await getData('week')
		let month = await getData('month')
		let all = await getData('all')
		let maps = await getMapData()
		let versus = await getVersusData()
		let duos = await getDuosData()
		res.json({
			day,
			week,
			month,
			all,
			maps,
			versus,
			duos
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getData(datePeriod) {
	let dateFilter = (datePeriod === 'all' ? '' : ` AND tp_playergame.datetime >= NOW() - interval '1 ${datePeriod}'`)
	let osFilter = (datePeriod === 'all' ? `ROUND(xpg.openskill::decimal, 2)::real` : `
		ROUND(
			(xpg.openskill::decimal - COALESCE(
				(
					SELECT openskill
					FROM tp_playergame
					WHERE tp_playergame.playerid = p.id AND tp_playergame.datetime < NOW() - interval '1 ${datePeriod}'
					ORDER BY datetime DESC
					LIMIT 1
				),
				0
			))::numeric,
			2
		)
	`)
	let having = (datePeriod === 'all' ? 'HAVING count(*) >= 250' : '')

	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY ${osFilter} DESC
			)::real rank,

			p.name as name,
			p.tpid as profile,

			COUNT(*)::real as games,
			COUNT(*) filter (WHERE tp_playergame.winner = true)::real as wins,
			COUNT(*) filter (WHERE tp_playergame.winner = false)::real as losses,

			ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS winrate,
			--ROUND(
			--		(
			--			COUNT(*) FILTER (WHERE tp_playergame.winner = true)::DECIMAL
			--			/
			--			COUNT(*) FILTER (WHERE tp_playergame.winner = true OR (tp_playergame.saveattempt = false AND tp_playergame.winner = false))::DECIMAL
			--		) * 100
			--, 2)::REAL as winrate,

			ROUND(AVG(tp_playergame.cap_team_for)::decimal, 2)::real as CF,
			ROUND(AVG(tp_playergame.cap_team_against)::decimal, 2)::real as CA,
			ROUND(AVG(tp_playergame.cap_team_for - tp_playergame.cap_team_against)::decimal, 2)::real as CD,

			array(
				SELECT jsonb_build_object(
					'tpid', tp_game.tpid,
					'winner', tp_playergame.winner
				)
				FROM tp_playergame
				LEFT JOIN tp_game on tp_game.id = tp_playergame.gameid
				WHERE tp_playergame.playerid = p.id ${dateFilter}
				ORDER BY tp_playergame.datetime DESC
				LIMIT 10
			) as form,

			TO_CHAR(SUM(tp_playergame.duration) * interval '1 sec', 'hh24:mi:ss') as timeplayed,
			MAX(tp_playergame.datetime) as lastgame,
			${osFilter} as openskill,
			xpg.flair as flair

		FROM tp_playergame
		LEFT JOIN tp_player as p ON p.id = tp_playergame.playerid
		LEFT JOIN tp_playergame as xpg ON p.id = xpg.playerid AND xpg.datetime = (
			SELECT MAX(datetime)
			FROM tp_playergame
			WHERE playerid = p.id
		)
		WHERE p.tpid is not null ${dateFilter} AND xpg.openskill is not null
		GROUP BY p.name, p.id, profile, tp_playergame.playerid, xpg.openskill, xpg.flair
		${having}
		ORDER BY rank ASC, cd DESC, winrate DESC, wins DESC
		LIMIT 100
	`, [], 'all')

	return raw
}

async function getMapData() {
	let raw = await db.select(`
		WITH data as (
			select
				RANK() OVER (
					ORDER BY
					(
						(
							COUNT(*) FILTER (WHERE tp_playergame.winner = true)
							/
							COUNT(*)::DECIMAL
						) * 100
					)
					*
					(
						0.5 * COUNT(*)::DECIMAL
					) DESC
				) rank2,
				tp_player.name,
				tp_player.tpid as profile,
				(SELECT flair from tp_playergame where playerid = tp_player.id order by datetime DESC limit 1) flair,
				tp_map.name as map,

				COUNT(*)::real as games,
				COUNT(*) filter (WHERE tp_playergame.winner = true)::real as wins,
				COUNT(*) filter (WHERE tp_playergame.winner = false)::real as losses,
				ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS winrate,

				MAX(tp_playergame.datetime) as lastgame,

				array(
					SELECT jsonb_build_object(
						'tpid', tp_g.tpid,
						'winner', tp_pg.winner
					)
					FROM tp_playergame as tp_pg
					LEFT JOIN tp_game as tp_g on tp_g.id = tp_pg.gameid
					WHERE tp_pg.playerid = tp_player.id AND tp_pg.saveattempt = false AND tp_g.mapid = tp_game.mapid
					ORDER BY tp_pg.datetime DESC
					LIMIT 10
				) AS form

			from tp_playergame
			left join tp_player on tp_player.id = tp_playergame.playerid
			left join tp_game on tp_game.id = tp_playergame.gameid
			left join tp_map on tp_game.mapid = tp_map.id
			where tp_player.tpid IS NOT NULL AND (tp_playergame.winner = true OR (tp_playergame.saveattempt = false AND tp_playergame.winner = false))
			group by tp_player.name, tp_map.name, tp_player.id, tp_game.mapid, tp_player.tpid
			order by rank2 asc
			limit 400
		)
		SELECT
			RANK() OVER (
				ORDER BY winrate DESC, games DESC
			) as rank,
			name,
			profile,
			flair,
			map,
			games,
			wins,
			losses,
			winrate,
            lastgame,
			form
		FROM data order by rank
	`, [], 'all')

	return raw
}

async function getVersusData() {
	let raw = await db.select(`
		WITH OpposingTeams AS (
			SELECT
				t1.gameid,
				t1.playerid AS player1,
				t2.playerid AS player2,
				t1.team AS team1,
				t2.team AS team2,
				t1.winner AS winner1,
				t2.winner AS winner2
			FROM
				public.tp_playergame t1
			JOIN
				public.tp_playergame t2 ON t1.gameid = t2.gameid
									AND t1.playerid < t2.playerid
									AND t1.team <> t2.team
			WHERE t1.saveattempt = false AND t2.saveattempt = false AND t1.openskill > 0 AND t2.openskill > 0
		)
		, HeadToHeadResults AS (
			SELECT
				gameid,
				CASE
					WHEN winner1 = true THEN player1
					WHEN winner2 = true THEN player2
				END AS winner_id,
				CASE
					WHEN winner1 = false THEN player1
					WHEN winner2 = false THEN player2
				END AS loser_id
			FROM
				OpposingTeams
		)
		, PlayerWinCounts AS (
			SELECT
				winner_id,
				loser_id,
				COUNT(*) AS wins
			FROM
				HeadToHeadResults
			GROUP BY
				winner_id,
				loser_id
		)
		, Head2Head AS (
			SELECT
				w_player.name as winner,
				w_player.tpid as winner_profile,
				l_player.name as loser,
				l_player.tpid as loser_profile,
				pw.winner_id AS winner_player_id,
				pw.loser_id AS loser_player_id,
				pw.wins,
				(SELECT count(*) from HeadToHeadResults WHERE (winner_id = pw.winner_id AND loser_id = pw.loser_id) OR (winner_id = pw.loser_id AND loser_id = pw.winner_id)) games
			FROM
				PlayerWinCounts pw
			LEFT JOIN tp_player as w_player on w_player.id = pw.winner_id
			LEFT JOIN tp_player as l_player on l_player.id = pw.loser_id
			WHERE
				w_player.tpid is not null and
				l_player.tpid is not null
			ORDER BY
				pw.wins DESC
			LIMIT 400
		)
		, data AS (
			SELECT
				RANK() OVER (
				ORDER BY
					(
						(
							wins::DECIMAL
							/
							games::DECIMAL
						) * 100
					)
					*
					(
						0.5 * games::DECIMAL
					) DESC
				) AS rank2,
				winner,
				winner_profile,
				loser,
				loser_profile,
				wins,
				games,
				ROUND((wins::DECIMAL / games::decimal) * 100, 0) AS winrate,

				(SELECT flair from tp_playergame where playerid = winner_player_id order by datetime DESC limit 1) winner_flair,
				(SELECT flair from tp_playergame where playerid = loser_player_id order by datetime DESC limit 1) loser_flair,
				-- (SELECT datetime from tp_playergame where playerid = winner_player_id order by datetime DESC limit 1) lastgame,
				(
					SELECT w_tp_playergame.datetime
					FROM tp_playergame as w_tp_playergame
					LEFT JOIN tp_playergame as l_tp_playergame on w_tp_playergame.gameid = l_tp_playergame.gameid AND l_tp_playergame.playerid = loser_player_id AND w_tp_playergame.team != l_tp_playergame.team
					LEFT JOIN tp_game on tp_game.id = w_tp_playergame.gameid
					WHERE w_tp_playergame.playerid = winner_player_id and w_tp_playergame.gameid = l_tp_playergame.gameid AND w_tp_playergame.saveattempt = false AND l_tp_playergame.saveattempt = false AND w_tp_playergame.openskill > 0 AND l_tp_playergame.openskill > 0
					AND w_tp_playergame.finished = true
					ORDER BY w_tp_playergame.datetime DESC
					LIMIT 1
				) lastgame,
				array(
					SELECT jsonb_build_object(
						'tpid', tp_game.tpid,
						'winner', w_tp_playergame.winner
					)
					FROM tp_playergame as w_tp_playergame
					LEFT JOIN tp_playergame as l_tp_playergame on w_tp_playergame.gameid = l_tp_playergame.gameid AND l_tp_playergame.playerid = loser_player_id AND w_tp_playergame.team != l_tp_playergame.team
					LEFT JOIN tp_game on tp_game.id = w_tp_playergame.gameid
					WHERE w_tp_playergame.playerid = winner_player_id and w_tp_playergame.gameid = l_tp_playergame.gameid AND w_tp_playergame.saveattempt = false AND l_tp_playergame.saveattempt = false AND w_tp_playergame.openskill > 0 AND l_tp_playergame.openskill > 0
					AND w_tp_playergame.finished = true
					ORDER BY w_tp_playergame.datetime DESC
					LIMIT 10
				) AS form

			from Head2Head
			order by rank2 asc
			limit 100
		)
		SELECT
			RANK() OVER (
				ORDER BY winrate DESC, games DESC
			) as rank,
			winner,
			winner_profile,
			loser,
			loser_profile,
			wins,
			games,
			winrate,
			winner_flair,
			loser_flair,
			lastgame,
			form
		FROM data order by rank
	`, [], 'all')

	return raw
}

async function getDuosData() {
	let raw = await db.select(`
		WITH HeadToHeadResults AS (
			SELECT
				t1.gameid,
				t1.playerid as player1,
				t2.playerid AS player2,
				p1.tpid,
				t1.winner as winner1,
				t2.winner as winner2
			FROM
				public.tp_playergame t1
			JOIN
				public.tp_playergame t2 ON t1.gameid = t2.gameid
									AND t1.playerid < t2.playerid
									AND t1.team = t2.team
			LEFT JOIN tp_player as p1 on p1.id = t1.playerid
			LEFT JOIN tp_player as p2 on p2.id = t2.playerid
			WHERE t1.saveattempt = false AND t2.saveattempt = false AND t1.openskill > 0 AND t2.openskill > 0 AND p1.tpid IS NOT null AND p2.tpid IS NOT null
		)
		, PlayerWinCounts AS (
			SELECT
				player1,
				player2,
				SUM(CASE WHEN winner1 = true AND winner2 = true THEN 1 ELSE 0 END) AS wins,
				COUNT(*) AS games
			FROM
				HeadToHeadResults
			GROUP BY
				player1,
				player2
		)
		, Head2Head AS (
			SELECT
				w_player.name as winner,
				w_player.tpid as winner_profile,
				l_player.name as loser,
				l_player.tpid as loser_profile,
				pw.player1 AS winner_player_id,
				pw.player2 AS loser_player_id,
				pw.wins,
				pw.games
			FROM
				PlayerWinCounts pw
			LEFT JOIN tp_player as w_player on w_player.id = pw.player1
			LEFT JOIN tp_player as l_player on l_player.id = pw.player2
			ORDER BY
				pw.wins DESC
			LIMIT 400
		)
		, data AS (
			SELECT
				RANK() OVER (
					ORDER BY
					(
						(
							wins::DECIMAL
							/
							games::DECIMAL
						) * 100
					)
					*
					(
						0.5 * games::DECIMAL
					) DESC
				) AS rank2,
				winner as player1,
				winner_profile as player1_profile,
				loser as player2,
				loser_profile as player2_profile,
				wins,
				games,
				ROUND((wins::DECIMAL / games::decimal) * 100, 0) AS winrate,
				(SELECT flair from tp_playergame where playerid = winner_player_id order by datetime DESC limit 1) player1_flair,
				(SELECT flair from tp_playergame where playerid = loser_player_id order by datetime DESC limit 1) player2_flair,
				(
					SELECT w_tp_playergame.datetime
					FROM tp_playergame as w_tp_playergame
					LEFT JOIN tp_playergame as l_tp_playergame on w_tp_playergame.gameid = l_tp_playergame.gameid AND l_tp_playergame.playerid = loser_player_id AND w_tp_playergame.team = l_tp_playergame.team
					LEFT JOIN tp_game on tp_game.id = w_tp_playergame.gameid
					WHERE w_tp_playergame.playerid = winner_player_id and w_tp_playergame.gameid = l_tp_playergame.gameid AND w_tp_playergame.saveattempt = false AND l_tp_playergame.saveattempt = false AND w_tp_playergame.openskill > 0 AND l_tp_playergame.openskill > 0
					AND w_tp_playergame.finished = true
					ORDER BY w_tp_playergame.datetime DESC
					LIMIT 1
				) lastgame,
				array(
					SELECT jsonb_build_object(
						'tpid', tp_game.tpid,
						'winner', w_tp_playergame.winner
					)
					FROM tp_playergame as w_tp_playergame
					LEFT JOIN tp_playergame as l_tp_playergame on w_tp_playergame.gameid = l_tp_playergame.gameid AND l_tp_playergame.playerid = loser_player_id AND w_tp_playergame.team = l_tp_playergame.team
					LEFT JOIN tp_game on tp_game.id = w_tp_playergame.gameid
					WHERE w_tp_playergame.playerid = winner_player_id and w_tp_playergame.gameid = l_tp_playergame.gameid AND w_tp_playergame.saveattempt = false AND l_tp_playergame.saveattempt = false AND w_tp_playergame.openskill > 0 AND l_tp_playergame.openskill > 0
					AND w_tp_playergame.finished = true
					ORDER BY w_tp_playergame.datetime DESC
					LIMIT 10
				) AS form

			from Head2Head
			order by rank2 asc
			limit 100
		)
		SELECT
			RANK() OVER (
				ORDER BY winrate DESC, games DESC
			) as rank,
			player1,
			player1_profile,
			player1_flair,
			player2,
			player2_profile,
			player2_flair,
			wins,
			games,
			winrate,
			lastgame,
			form
		FROM data ORDER BY rank
	`, [], 'all')

	return raw
}
