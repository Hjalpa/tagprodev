const admin = {}

admin.players = {
	init: async li => {
		const _t = admin.players

		_t.form = document.querySelector('.playeredit form')

		_t.bindings()
		_t.validate()
	},

	bindings: async e => {
		const _t = admin.players

		_t.form.addEventListener('input', _t.control)
		_t.form.addEventListener('click', _t.control)
	},

	control: async e => {
		const _t = admin.players

		let save = util.findParentBySelector(e.target, '.save')
		let del = util.findParentBySelector(e.target, '.delete')
		let confirmDel = util.findParentBySelector(e.target, ".delete-confirm")

		if (save)
			await _t.save(e)

		else if(del)
			await _t.deleteConfirm(e)

		else if(confirmDel)
			await _t.deletePlayer(e)

		_t.validate()
	},

	validate: e => {
		const _t = admin.players
		_t.form.querySelector('button.save').disabled = _t.form.querySelector(':invalid')
	},

	save: async e => {
		e.preventDefault()
		const _t = admin.players

		let data = util.getFormData(_t.form)
		console.log(data)

		let raw = await fetch('/admin/players', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache',
			},
			body: JSON.stringify(data)
		})
		let response = await raw.json()
		console.log(response, data)

		if(response.success) {
			window.location.replace(`./?name=${data.name}`)
		}
		else {
			// error
		}
	},

	deletePlayer: async e => {
		e.preventDefault()
		const _t = admin.players

		let yes = util.findParentBySelector(e.target, ".yes")
		let no = util.findParentBySelector(e.target, ".no")

		if(no)
			document.querySelector('.delete-confirm').classList.remove('active')

		else if(yes) {

			let raw = await fetch('/admin/players', {
				method: 'DELETE',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
				},
				body: JSON.stringify({
					playerid: parseInt(_t.form.querySelector('[name="playerid"]').value)
				})
			})
			let response = await raw.json()
			if(response.succcess)
				window.location.replace(`./`)
		}
	},

	deleteConfirm: e => {
		e.preventDefault()
		const _t = admin.players

		_t.form.querySelector('.delete-confirm').classList.add('active')
	}

}



admin.players.init()
