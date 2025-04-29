app.tablesort = {
	init: async e => {

		if(document.querySelector('.player-stats')) {
			await app.tablesort.highlight()

			const containerRef = document.querySelector('.player-stats')
			items = [...containerRef.querySelectorAll('.row.entry')].map(item=>app.tablesort.sortable(item))

			document.querySelector('.row.head').addEventListener('click', (e) => {
				let col = util.findParentBySelector(e.target, '[data-column]')

				if(col) {
					// set active column
					if(document.querySelector('.row.head .active')) {
						document.querySelector('.row.head .active').classList.remove('active')
					}
					col.classList.add('active')

					// sort
					let column = col.dataset.column
					items
						.sort((b,a)=> a[column] - b[column])
						.forEach(el=>containerRef.appendChild(el.itmRef) )
				}

			})

		}

	},

	highlight: e => {
		let data = {}
		document.querySelectorAll('.row.entry').forEach((row) => {

			// each player value
			row.querySelectorAll('[data-column]:not([data-column=mins]').forEach((pv) => {
				let value = util.getValue(pv.innerText)
				let label = pv.dataset.column

				if(!Object.keys(data).includes(label)) {
					data[label] = value
					if(value > 0)
						pv.classList.add('highlight')
				}

				else if(value >= data[label]) {

					if(value > data[label])
						document.querySelectorAll('[data-column="'+label+'"].highlight').forEach(e => e.classList.remove('highlight'))

					if(value > 0)
						pv.classList.add('highlight')

					data[label] = value
				}

			})
		})
	},

	sortable: row => {
		let data = {itmRef:row}
		row.querySelectorAll('[data-column]').forEach((elm) => {
			let name = elm.dataset.column
			data[name] = util.getValue(elm.innerText)
		})

		return data
	}

}
