const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {

	let data = {
		title: 'Table',
		nav: {
			primary: 'superleague',
			secondary: 'table',
		},
		table: await getTable()
	}

	res.render('superleague-table', data)
}

async function getTable() {
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
			) as capdifference

		from seasonteam st
		left join team t on st.teamid = t.id
		where st.seasonid = 5
		order by pts DESC, capdifference desc, name asc
	`, [], 'all')

	return await raw
}
