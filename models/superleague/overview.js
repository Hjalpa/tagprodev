const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: 'NF Season ' + req.season,
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: 'nf',
					page: 'overview'
				}
			},
			date: await getSeasonDate(req.seasonid),
			teams: await getTeamCount(req.seasonid),
			players: await getPlayerCount(req.seasonid),
			mvb: await getMVB(req.seasonid),
			champions: await getChampions(req.seasonid),
			maps: await getMaps(req.seasonid),
		}
		res.render('superleague-overview', data);
		// res.json(data)
	} catch(e) {
		res.status(400).json({error: e})
	}
}

async function getSeasonDate(seasonid) {
	let raw = await db.select(`
		SELECT

			TO_CHAR(MIN(date), 'Mon DD') as start,
			TO_CHAR(MAX(date), 'Mon DD, YYYY') as end

		FROM seasonschedule
		WHERE SeasonID = $1
		GROUP BY seasonschedule.seasonid
		LIMIT 1
	`, [seasonid], 'row')
	return raw
}

async function getTeamCount(seasonid) {
	let raw = await db.select(`
		SELECT count(*) as total FROM seasonteam WHERE seasonid = $1
	`, [seasonid], 'total')

	return raw
}

async function getPlayerCount(seasonid) {
	let raw = await db.select(`
		SELECT count(*) as total
		FROM seasonplayer
		LEFT JOIN seasonteam ON seasonplayer.seasonteamid = seasonteam.id
		WHERE seasonid = $1
	`, [seasonid], 'total')

	return raw
}

async function getPlayerCount(seasonid) {
	let raw = await db.select(`
		SELECT count(*) as total
		FROM seasonplayer
		LEFT JOIN seasonteam ON seasonplayer.seasonteamid = seasonteam.id
		WHERE seasonid = $1
	`, [seasonid], 'total')

	return raw
}

async function getMVB(seasonid) {
	let mvb = `
		Round(
                Round(
                        sum(cap)
                        * 100
                , 0)
                +
                Round(
                        count(*) filter (where cap >= 3)
                        * 100
                , 0)
                +
                    Round(sum(cap_from_tapin) * 25, 0)
                +

                    Round(sum(cap_whilst_having_active_pup) * 25, 0)
                +
                    Round((sum(pup_rb) + sum(pup_jj) * 25), 0)
                +
                    Round(sum(assist) * 50, 0)
                +
                    (
                        (count(*) filter (where assist >= 3) * 100)
                    )
                +
                    Round(sum(tapin_from_my_chain) * 50, 0)
                +
                    Round(sum(takeover_good) * 5, 0)
                +
                    Round(sum(tag) * 2, 0)
                +
                    Round(sum(hold) / 2, 0)
                +
                    Round(sum(flag_carry_distance) / 10, 0)
                +
                    (sum(prevent) / 4)
                +
                    Round(sum(long_hold) * 50, 0)
                +
                    Round((sum(hold_before_cap)::DECIMAL / sum(cap)::DECIMAL) * 150, 0)
                +
                    Round(sum(chain) * 15, 0)
		, 0)
	`

	let raw = await db.select(`
		SELECT
			RANK() OVER (
				ORDER BY ${mvb} DESC
			) rank,
			player.name as player,
			COALESCE(team.acronym, 'SUB') as acronym,
			COALESCE(team.color, '#404040') as color,
			${mvb} as value

		FROM playergame
		LEFT JOIN game ON game.id = playergame.gameid
		LEFT JOIN seasonschedule ON game.id = seasonschedule.gameid
		LEFT JOIN player ON player.id = playergame.playerid

		LEFT JOIN seasonplayer ON player.id = seasonplayer.playerid
		LEFT JOIN seasonteam ON seasonteam.id = seasonplayer.seasonteamid
		LEFT JOIN team ON seasonteam.teamid = team.id

		-- WHERE seasonschedule.seasonid = $1 AND league = true AND seasonteam.seasonid = $1
		WHERE seasonteam.seasonid = $1 AND league = true

		-- OR (seasonschedule.playoff = TRUE AND seasonschedule.final = FALSE)

		GROUP BY player.name, team.acronym, team.color

		having sum(play_time) > 8000
		order by value DESC
		limit 10
	`, [seasonid], 'all')
	return raw
}

async function getMaps(seasonid) {
	let raw = await db.select(`
		select
			RANK() OVER (
				ORDER BY
					map DESC
			) rank,

			map.name as mpa,

			ROUND(
				(avg(cap) * 100)  +
				(avg(assist) * 50) +
				(avg(takeover_good) * 20)+
				(avg(tag)*5) +
				(avg(pup_jj) + avg(pup_rb)) * 10 +
				((avg(hold) / avg(grab) * 5)) +
				(avg(chain) * 10) +
				(avg(prevent) / 3) +
				avg(kept_flag)
			, 0) as value

		FROM playerschedule
		LEFT JOIN game on game.id = playerschedule.gameid
		LEFT JOIN playergame ON game.id = playergame.gameid
		left join map on map.id = playergame.mapid

		where seasonschedule.seasonid = $1
		group by map.name

		order by value DESC
		limit 10
	`, [seasonid], 'all')
	return raw
}

async function getChampions(seasonid) {
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
        WHERE st.seasonid = $1 AND st.winner = true
        GROUP BY t.id, t.name, t.acronym, t.logo, t.color, st.id, st.winner
        ORDER BY t.name ASC
	`, [seasonid], 'row')
	return raw
}
