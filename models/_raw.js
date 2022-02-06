process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const exec = require('child_process').exec

module.exports.game = async (req, res) => await game(req, res)
let game = async (req, res) => {
	let euid = parseInt(req.query.euid)

	function isNumeric(x) {
		return parseFloat(x).toString() === x.toString();
	}

	if(isNumeric(req.query.euid))
		exec(`php stat-gen/index.php ${euid}`, async (error, raw) => {
			if(error)
				res.status(400).send(error)

			let data = JSON.parse(raw)
			res.json(data)
			// res.send(raw)
		})
	else
		res.status(400).json({error: "euid doesn't exist"})
}
