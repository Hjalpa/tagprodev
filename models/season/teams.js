const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: req.mode.toUpperCase() + ' Season ' + req.season + ' Teams',
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: req.mode,
					page: 'teams'
				}
			},
			teams: await getTeams(req.seasonid),
		}
		res.render('superleague-teams', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getTeams(seasonid) {
	let raw = await db.select(`
        SELECT
            t.id,
            t.name,
            t.acronym,
            t.logo,
            t.color,
            st.id,
			st.winner,

            ARRAY(
				select json_build_object('name', name, 'country', LOWER(country), 'manager', seasonplayer.manager, 'captain', seasonplayer.captain, 'cost', seasonplayer.cost)
                from player
                left join seasonplayer on seasonplayer.playerid = player.id
                left join seasonteam on seasonplayer.seasonteamid = seasonteam.id
                where seasonteam.id = st.id
                ORDER BY captain DESC, cost DESC, st.id DESC
            ) AS players

        FROM seasonplayer as sp
        LEFT JOIN seasonteam as st on st.id = sp.seasonteamid
        LEFT JOIN team as t on t.id = st.teamid
        WHERE st.seasonid = $1
        GROUP BY t.id, t.name, t.acronym, t.logo, t.color, st.id, st.winner, st.runnerup
        ORDER BY t.name ASC
	`, [seasonid], 'all')

	return raw
}
