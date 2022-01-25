const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {

		// check page exists
		if(req.params.id)
			if(req.params.id != 'playoffs')	throw 'invalid page'

		let filters = {
			seasonid: 5,
			league: (req.params.id) ? false : true,
			playoff: (req.params.id) ? true : false
		}

		let data = {
			title: 'Schedule',
			nav: {
				primary: 'superleague',
				secondary: 'schedule',
				tertiary: filters.schedule
			},
			schedule: await getSchedule(filters),
		}
		res.render('superleague-schedule', data)
	}
	catch(error) {
		res.status(404).render('404')
	}
}

async function getSchedule(filters) {
	let raw = await db.select(`
		SELECT
			seasonschedule.id as seasonscheduleid,
			seasonschedule.date,
			map.name as map,
			map.unfortunateid as unfortunateid,
			seasonschedule.order as order,

			redteam.name as redname,
			redteam.acronym as redacronym,
			redteam.logo as redlogo,
			redteam.color as redcolor,

			blueteam.name as bluename,
			blueteam.acronym as blueacronym,
			blueteam.logo as bluelogo,
			blueteam.color as bluecolor,

			game.redcaps as redcaps,
			game.bluecaps as bluecaps,
			game.euid as euid

		from seasonschedule

		left join seasonteam rst on rst.id = seasonschedule.teamredid
		left join team as redteam on redteam.id = rst.id

		left join seasonteam bst on bst.id = seasonschedule.teamblueid
		left join team as blueteam on blueteam.id = bst.id

		left join map on map.id = seasonschedule.mapid

		left join game on game.id = seasonschedule.gameid

		where seasonschedule.seasonid = $1 AND seasonschedule.league = $2 AND seasonschedule.playoff = $3

		order by seasonschedule.id asc, seasonschedule.order asc
	`, [filters.seasonid, filters.league, filters.playoff], 'all')

	// return await raw
	return await format(raw, filters)
}


async function format(raw, filters) {
	const schedule = {}

	if(filters.league) {
		for (let k in raw) {
			let d = raw[k]

			let date = util.displayDate(raw[k].date, 'weekday day month')

			if(!schedule[date])
				schedule[date] = {
					round: {}
				}

			if(!schedule[date]['round'][d.order])
				schedule[date]['round'][d.order] = {
					map: {
						name: d.map,
						unfortunateid: d.unfortunateid
					},
					fixtures: [],
				}

			schedule[date]['round'][d.order]['fixtures'].push({
				euid: d.euid,
				seasonscheduleid: d.seasonscheduleid,
				red: {
					name: d.redname,
					acronym: d.redacronym,
					logo: d.redlogo,
					color: d.redcolor,
					caps: d.redcaps
				},
				blue: {
					name: d.bluename,
					acronym: d.blueacronym,
					logo: d.bluelogo,
					color: d.bluecolor,
					caps: d.bluecaps
				}
			})
		}
	}

	else if(filters.playoff) {
		for (let k in raw) {
			let d = raw[k]

			let date = util.displayDate(raw[k].date, 'weekday day month')

			if(!schedule[date])
				schedule[date] = {
					round: {}
				}

			if(!schedule[date]['round'][d.order])
				schedule[date]['round'][d.order] = {
					map: {
						name: d.map,
						unfortunateid: d.unfortunateid
					},
					fixtures: [],
				}

			schedule[date]['round'][d.order]['fixtures'].push({
				euid: d.euid,
				seasonscheduleid: d.seasonscheduleid,
				red: {
					name: d.redname,
					acronym: d.redacronym,
					logo: d.redlogo,
					color: d.redcolor,
					caps: d.redcaps
				},
				blue: {
					name: d.bluename,
					acronym: d.blueacronym,
					logo: d.bluelogo,
					color: d.bluecolor,
					caps: d.bluecaps
				}
			})
		}

	}

	return schedule
}
