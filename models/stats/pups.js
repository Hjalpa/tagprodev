const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Powerups',
		maps: await req.maps,
		results: await getData(req.query)
	}
	res.render('stats', data);
}

async function getData(filters) {
	let f = util.getFilters(filters)
	let sql = `
		SELECT
			RANK() OVER (
				ORDER BY
					TO_CHAR(
						(sum(play_time) / (sum(pup_jj)+sum(pup_rb)+sum(pup_tp))) * interval '1 sec'
					, 'MI:SS') ASC
			) rank,

			player.name as player,

			-- tagpro spawn chance
			ROUND(
				(
					(sum(pup_tp_team_for)+sum(pup_tp_team_against))::FLOAT
					/
					(sum(pup_tp_team_for)+sum(pup_tp_team_against)+sum(pup_jj_team_for)+sum(pup_jj_team_against)+sum(pup_rb_team_for)+sum(pup_rb_team_against))::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as tagpro_spawn_chance,

			-- tagpro every
			TO_CHAR(
				(sum(play_time) / (sum(pup_tp))) * interval '1 sec'
			, 'MI:SS') as tagpro_every,

			-- team plus minus difference
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
			, 2) || '%' as team_pup_diff,


			-- my share from team overall
			ROUND(
				(
					(sum(pup_tp)+sum(pup_rb)+sum(pup_jj))::FLOAT
					/
					(sum(pup_tp_team_for)+sum(pup_rb_team_for)+sum(pup_jj_team_for))::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as share_of_teams_pups,

			-- my share from game
			ROUND(
				(
					(sum(pup_tp)+sum(pup_rb)+sum(pup_jj))::FLOAT
					/
					(sum(pup_tp_team_for)+sum(pup_tp_team_against)+sum(pup_rb_team_for)+sum(pup_rb_team_against)+sum(pup_jj_team_for)+sum(pup_jj_team_against))::FLOAT
				)::NUMERIC
					* 100
			, 2) || '%' as share_of_games_pups,

			TO_CHAR(
				(sum(play_time) / (sum(pup_tp)+sum(pup_rb)+sum(pup_jj))) * interval '1 sec'
			, 'MI:SS') as pup_every

		FROM playergame
		LEFT JOIN player ON player.id = playergame.playerid
		${f.where}
		GROUP BY player.name
		${f.having}
		ORDER BY pup_every ASC
		LIMIT 100
	`
	return await db.select(sql, [], 'all')
}
