const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: req.mode.toUpperCase() + ' Season ' + req.season + ' League Table',
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: req.mode,
					page: 'league',
				}
			},
			table: await getTable(req.seasonid)
		}
		res.render('superleague-league', data)
	} catch(error) {
		res.status(404).render('404')
	}
}

async function getTable(seasonid) {
	let raw = await db.select(`
		select
			t.id,
			t.name,
			t.acronym,
			t.logo,
			t.color,
			(
				SELECT jsonb_build_object(
					-- caps for
					'cf',
					(
						COALESCE(sum(redcaps) filter (WHERE teamredid = st.id), 0)
						+
						COALESCE(sum(bluecaps) filter (WHERE teamblueid = st.id), 0)
					),
					-- caps against
					'ca',
					(
						COALESCE(sum(bluecaps) filter (WHERE teamredid = st.id), 0)
						+
						COALESCE(sum(redcaps) filter (WHERE teamblueid = st.id), 0)
					),
					-- cap difference
					'cd',
					(
						(
							COALESCE(sum(redcaps) filter (WHERE teamredid = st.id), 0)
							+
							COALESCE(sum(bluecaps) filter (WHERE teamblueid = st.id), 0)
						)
						-
						(
							COALESCE(sum(bluecaps) filter (WHERE teamredid = st.id), 0)
							+
							COALESCE(sum(redcaps) filter (WHERE teamblueid = st.id), 0)
						)
					),
					-- wins
					'won',
					(
						count(*) filter (WHERE teamredid = st.id AND redcaps > bluecaps)
						+
						count(*) filter (WHERE teamblueid = st.id AND bluecaps > redcaps)
					),
					-- losses
					'lost',
					(
						count(*) filter (WHERE teamredid = st.id AND redcaps < bluecaps)
						+
						count(*) filter (WHERE teamblueid = st.id AND bluecaps < redcaps)
					),
					-- draws
					'drawn',
					(
						count(*) filter (WHERE teamredid = st.id AND redcaps = bluecaps)
						+
						count(*) filter (WHERE teamblueid = st.id AND bluecaps = redcaps)
					),
					-- points
					'points',
					(
						(
							(
								count(*) filter (WHERE teamredid = st.id AND redcaps > bluecaps)
								+
								count(*) filter (WHERE teamblueid = st.id AND bluecaps > redcaps)
							) * 3
						) + count(*) filter (WHERE teamredid = st.id AND redcaps = bluecaps) + count(*) filter (WHERE teamblueid = st.id AND bluecaps = redcaps)
					),

					'winrate',
					(
						ROUND(
							(
								(
									count(*) filter (WHERE teamredid = st.id AND redcaps > bluecaps)
									+
									count(*) filter (WHERE teamblueid = st.id AND bluecaps > redcaps)
								)
								/
								greatest( count(*) filter (WHERE teamredid = st.id OR teamblueid = st.id) , 1)::DECIMAL
							) * 100
						, 1)
					)
				)
				FROM seasonschedule
				LEFT JOIN game ON seasonschedule.gameid = game.id
				WHERE seasonschedule.seasonid = 5 AND seasonschedule.league IS TRUE AND seasonschedule.gameid IS NOT null -- AND (seasonschedule.teamredid = 3 OR seasonschedule.teamblueid = 3)
			) as data,

			(
				SELECT

					(
						(
							count(*) filter (WHERE teamredid = st.id AND redcaps > bluecaps)
							+
							count(*) filter (WHERE teamblueid = st.id AND bluecaps > redcaps)
						) * 3
					) + count(*) filter (WHERE teamredid = st.id AND redcaps = bluecaps) + count(*) filter (WHERE teamblueid = st.id AND bluecaps = redcaps)

				FROM seasonschedule
				LEFT JOIN game ON seasonschedule.gameid = game.id
				WHERE seasonschedule.seasonid = 5 AND seasonschedule.league IS TRUE AND seasonschedule.gameid IS NOT null -- AND (seasonschedule.teamredid = 3 OR seasonschedule.teamblueid = 3)
			) as pts,

			(
				SELECT

					(
						(
							COALESCE(sum(redcaps) filter (WHERE teamredid = st.id), 0)
							+
							COALESCE(sum(bluecaps) filter (WHERE teamblueid = st.id), 0)
						)
							-
						(
							COALESCE(sum(bluecaps) filter (WHERE teamredid = st.id), 0)
							+
							COALESCE(sum(redcaps) filter (WHERE teamblueid = st.id), 0)
						)
					)

				FROM seasonschedule
				LEFT JOIN game ON seasonschedule.gameid = game.id
				WHERE seasonschedule.seasonid = 5 AND seasonschedule.league IS TRUE AND seasonschedule.gameid IS NOT null -- AND (seasonschedule.teamredid = 3 OR seasonschedule.teamblueid = 3)
			) as capdifference,

			array(
				SELECT jsonb_build_object(
				'euid', euid,
				'result',
					CASE
						WHEN
							(seasonschedule.teamredid = t.id AND redcaps > bluecaps) OR (seasonschedule.teamblueid = t.id AND bluecaps > redcaps) THEN 'w'
						WHEN
							(seasonschedule.teamredid = t.id AND redcaps = bluecaps) OR (seasonschedule.teamblueid = t.id AND bluecaps = redcaps) THEN 't'
						WHEN
							(seasonschedule.teamredid = t.id AND redcaps < bluecaps) OR (seasonschedule.teamblueid = t.id AND bluecaps < redcaps) THEN 'l'
					END
				,
				'map', map.name
				)
				FROM seasonschedule
				LEFT JOIN game on game.id = seasonschedule.gameid
				LEFT JOIN map on game.mapid = map.id
				WHERE (seasonschedule.teamredid = t.id OR seasonschedule.teamblueid = t.id) AND gameid IS NOT NULL AND seasonschedule.seasonid = 5 AND league IS true
				ORDER BY seasonschedule.date ASC, seasonschedule.order ASC
			) as form

		from seasonteam st
		left join team t on st.teamid = t.id
		where st.seasonid = $1
		order by pts DESC, capdifference desc, name asc
	`, [seasonid], 'all')

	return await raw
}
