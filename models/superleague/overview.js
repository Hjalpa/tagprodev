const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {

		let data = {
			title: 'Overview',
			nav: {
				primary: 'superleague',
				secondary: 'overview',
			},

			teams: await getTeams(),

		}
		res.render('superleague-overview', data);
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getTeams() {
	let raw = await db.select(`
        SELECT
            t.id,
            t.name,
            t.acronym,
            t.logo,
            t.color,
            st.id,

            ARRAY(
				select json_build_object('name', name, 'country', LOWER(country), 'captain', seasonplayer.captain)
                from player
                left join seasonplayer on seasonplayer.playerid = player.id
                left join seasonteam on seasonplayer.seasonteamid = seasonteam.id
                where seasonteam.id = st.id
                ORDER BY captain DESC, name ASC
            ) AS players

        FROM seasonplayer as sp
        LEFT JOIN seasonteam as st on st.id = sp.seasonteamid
        LEFT JOIN team as t on t.id = st.teamid
        WHERE st.seasonid = 5
        GROUP BY t.id, t.name, t.acronym, t.logo, t.color, st.id
        ORDER BY t.name ASC
	`, [], 'all')

	return raw
}
