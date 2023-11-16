const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => {
	try {
		let day = await getData('day')
		let week = await getData('week')
		let month = await getData('month')
		let all = await getData('all')
		res.json({
			day,
			week,
			month,
			all
		})
	} catch(e) {
		res.status(400).send({error: e})
	}
}

async function getData(datePeriod) {
	let dateFilter = (datePeriod === 'all' ? '' : ` AND tp_playergame.datetime >= NOW() - interval '1 ${datePeriod}'`)
	let rankFilter= (datePeriod === 'all' ? 'p.openskill:real' : 'SUM(cap_team_for - cap_team_against)::real')

	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY ${rankFilter} DESC
			)::real rank,

			p.name as name,
			p.tpid as profile,

			COUNT(*)::real as games,
			COUNT(*) filter (WHERE tp_playergame.winner = true)::real as wins,
			COUNT(*) filter (WHERE tp_playergame.winner = false)::real as losses,

			ROUND(COUNT(*) FILTER (WHERE tp_playergame.winner = true) * 100.0 / COUNT(*), 2)::REAL AS winrate,

			SUM(cap_team_for)::real as CF,
			SUM(cap_team_against)::real as CA,
			SUM(cap_team_for - cap_team_against)::real as CD,

			array(
				SELECT jsonb_build_object(
					'uuid', tp_game.uuid,
					'winner', tp_playergame.winner
				)
				FROM tp_playergame
				LEFT JOIN tp_game on tp_game.id = tp_playergame.gameid
				WHERE tp_playergame.playerid = p.id ${dateFilter}
				ORDER BY tp_playergame.datetime DESC
				LIMIT 10
			) as form,

			TO_CHAR(SUM(duration) * interval '1 sec', 'hh24:mi:ss') as timeplayed,
			MAX(tp_playergame.datetime) as lastgame,

			ROUND(p.openskill::decimal, 2)::real as openskill,
			(SELECT flair from tp_playergame as tppg where tppg.playerid = p.id ORDER by id DESC LIMIT 1) as flair

		FROM tp_playergame
		LEFT JOIN tp_player as p ON p.id = tp_playergame.playerid
		WHERE p.tpid is not null ${dateFilter} AND p.openskill is not null
		GROUP BY p.name, p.id, p.openskill, profile
		ORDER BY rank ASC, cd DESC, winrate DESC, wins DESC
		LIMIT 100
	`, [], 'all')

	return raw
}
