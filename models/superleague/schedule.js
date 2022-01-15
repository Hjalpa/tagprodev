const db = require ('../../lib/db')
const util = require ('../../lib/util')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	let data = {
		title: 'Schedule',
		nav: {
			primary: 'superleague',
			secondary: 'schedule',
		},
		schedule: await getSchedule(5),
	}

	res.render('superleague-schedule', data)
}

async function getSchedule(seasonid) {
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

		where seasonschedule.seasonid = $1

		order by seasonschedule.id asc, seasonschedule.order asc
	`, [seasonid], 'all')

	// return await raw
	return await format(raw)
}


async function format(raw) {
	const schedule = {}

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

	return schedule
}
