const db = require('../../lib/db')

module.exports.init = async (req, res) => {
	let data = {
		config: {
			nav: 'overview',
			title: 'Overview',
		},
		// totalUsers: await getTotalUsers(),
		// totalFoods: await getTotalFoods(),
	}
	res.render('admin', data)

	// async function getTotalUsers() {
	// 	return await db.query(`SELECT count(*) as total FROM public.user`, 'total')
	// }

	// async function getTotalFoods() {
	// 	return await db.query(`
	// 		SELECT
	// 			to_char(reltuples::bigint, 'FM9,999,999') AS total
	// 		FROM pg_class
	// 		WHERE relname = 'food'
	// 	`, 'total')
	// }
}
