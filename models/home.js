const db = require ('../lib/db')
const util = require ('../lib/util')

module.exports.init = async (req, res) => {
	try {
		let data = {
			config: {
				title: 'Tagpro European Hub',
				name:  'Tagpro European Hub',
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: 'home',
					page: 'overview'
				}
			},
			seasons: await getSeasons(),
		}
		res.render('seasons', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getSeasons() {
	let raw = await db.select(`
		select
			season.mode, season.number,
			(select TO_CHAR(MIN(date), 'Mon DD, YYYY') from seasonschedule where seasonid = season.id) as date,

			(
				SELECT json_build_object(
					'name', team.name,
					'logo', team.logo,
					'acronym', team.acronym,
					'color', team.color
				) FROM seasonteam
				LEFT JOIN team on seasonteam.teamid = team.id
				WHERE winner = TRUE AND seasonid = season.id
			) as playoffwinner,

			(
				SELECT COUNT(*)
				FROM seasonplayer sp
				INNER JOIN seasonteam st ON sp.seasonteamid = st.id
				WHERE st.seasonid = season.id
			) as players,


			(select count(*) from seasonteam where seasonid = season.id) as teams,

			(
				SELECT COUNT(DISTINCT mapid) as total_maps
				FROM game g
				WHERE g.seasonid = season.id
			) as maps,



			(
				SELECT COUNT(*)
				FROM game g
				INNER JOIN season s ON g.seasonid = s.id
				WHERE s.id = season.id
			) as games,

			(
				-- SELECT SUM(g.redcaps + bluecaps)
				SELECT ROUND(
				SUM(g.redcaps + g.bluecaps)::DECIMAL
				/
				SUM(g.duration / 60)::DECIMAL
				, 2)
				FROM game g
				INNER JOIN season s ON g.seasonid = s.id
				WHERE s.id = season.id
				GROUP BY g.seasonid
			) as CPM

		FROM season
		ORDER BY season.id DESC
	`, [], 'all')

	return raw
}
