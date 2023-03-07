const db = require ('../lib/db')
const util = require ('../lib/util')

const axios = require('axios')
const jsdom = require('jsdom')

module.exports.init = async (req, res) => await init(req, res)
let init = async (req, res) => {
	try {
		let data = {
			config: {
				title: req.mode.toUpperCase() + ' Season ' + req.season + ' Signup',
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: req.mode,
					page: 'league',
				}
			},
			signups: await getSignups(req.seasonid)
		}
		res.render('signup', data)
	} catch(error) {
		res.status(404).render('404')
	}
}

async function getSignups(seasonid) {
	return db.select('SELECT username, profile FROM signup WHERE seasonid = $1 AND verified = $2', [seasonid, true], 'all')
}

async function getProfile(profile) {
	let raw = await axios.get(profile)
	raw.headers['content-type']

	return await new jsdom.JSDOM(raw.data)
}

module.exports.signup = async (req, res) => await signup(req, res)
let signup = async (req, res) => {
	let data = {}

	try {

		// step 0
		if(req.body.profile) {
			let profile = req.body.profile.trim()

			// first check that the signup doesn't exist
			let exists = await db.select('SELECT * FROM signup WHERE verified = TRUE AND seasonid = $1 AND profile = $2 LIMIT 1', [req.seasonid, profile], 'row')
			if(exists)
				data = {
					id: exists.id,
					username: exists.username,
					step: 1,
				}

			else {

				// validate profile regex
				if(!profile.includes('koalabeast.com/profile/'))
					throw 'invalid tagpro url'

				const dom = await getProfile(profile)

				// get username
				let username = dom.window.document.querySelector('.profile-name')

				if(!username)
					throw 'bad profile URL'

				if(username) username = username.textContent.trim()

				// get flair
				let flair_raw  = dom.window.document.querySelector('#owned-flair .flair-available.selected .flair-header')
				let flair = flair_raw.textContent.trim()

				// if flair "Remove Flair"?
				let step1 = (flair === 'Remove Flair') ? true : false

				// else
				await db.insertUpdate('signup', {
					seasonid: req.seasonid,
					profile,
					username,
					flair,
					ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
					step1,
					step2: false,
					date: 'now()'
				}, ['seasonid', 'profile'])

				// get the insert (because can't do this with insertUpdate)
				raw = await db.select('SELECT * FROM signup WHERE profile = $1 AND seasonid = $2', [profile, req.seasonid], 'row')

				if(raw)
					data = {
						id: raw.id,
						username,
						step: (step1) ? 2 : 1,
					}

			}
		}

		// steps
		else if(req.body.id) {
			data = await db.select('SELECT id, username, step1, step2, profile, seasonid FROM signup WHERE id = $1', [req.body.id], 'row')
			const dom = await getProfile(data.profile)

			// get flair
			let flair_raw  = dom.window.document.querySelector('#owned-flair .flair-available.selected .flair-header')
			let flair = flair_raw.textContent.trim()


			if(data.step1 & data.step2) {
				data = {
					id: data.id,
					username: data.username,
					step: 1,
					error: {
						msg: 'incorrect flair',
						current: flair,
						awaiting: 'Remove Flair'
					}
				}
			}

			// step 1
			else if(!data.step1) {
				data.step1 = (flair === 'Remove Flair') ? true : false

				if(data.step1) {
					await db.insertUpdate('signup', data, ['seasonid', 'profile'])
					data.step = 2
				}
				else
					data = {
						id: data.id,
						username: data.username,
						step: 1,
						error: {
							msg: 'incorrect flair',
							current: flair,
							awaiting: 'Remove Flair'
						}
					}
			}

			// step 2
			else if(!data.step2) {
				data.step2 = (flair === 'Pencil') ? true : false

				if(data.step2) {
					data.verified = true
					await db.insertUpdate('signup', data, ['seasonid', 'profile'])
					data.step = 'verified'
					data.success = true
				}
				else
					data = {
						id: data.id,
						username: data.username,
						step: 2,
						error: {
							msg: 'incorrect flair',
							current: flair,
							awaiting: 'Pencil'
						}
					}

			}

		}

		// console.log(data)
	} catch(e) {
		console.log('error: ' + e)
	}

	res.json(data)
}

module.exports.draftpacket = async (req, res) => await draftpacket(req, res)
let draftpacket = async (req, res) => {
	try {
		// last went for
		// 	super league NF euroll amount
		// 	eltp amount
		let signups = await db.select(`
			SELECT
				-- RANK() OVER ( ORDER BY date DESC ) rank,
				LOWER(player.country) as country,
				player.name as player,
				signup.profile,
				-- (SELECT (sum(cost) / count(*)) FROM seasonplayer WHERE seasonplayer.playerid = signup.playerid GROUP BY seasonplayer.playerid) as avgcost,
				signup.notes

			FROM signup
			LEFT JOIN player on signup.playerid = player.id
			WHERE signup.seasonid = $1 AND signup.verified = $2 AND captain = FALSE
			ORDER BY signup.captain DESC, signup.rating DESC
		`, [req.seasonid, true], 'all')

		let data = {
			config: {
				title: req.mode.toUpperCase() + ' Season ' + req.season + ' Draft Packet',
				name: req.seasonname,
				path: req.baseUrl,
				season: req.season,
				nav: {
					cat: req.mode,
					page: 'league',
				}
			},
			signups
		}
		res.render('signups', data)
	} catch(error) {
		res.status(404).render('404')
	}
}
