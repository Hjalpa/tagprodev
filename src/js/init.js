const app = {}

app.tablesort= (async () => {
	if(document.querySelector('.player-stats')) {
		await highlight()

		const containerRef = document.querySelector('.player-stats')
		items = [...containerRef.querySelectorAll('.row.entry')].map(item=>sortable(item))

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

	async function highlight() {
		let data = {}
		document.querySelectorAll('.row.entry').forEach((row) => {

			// each player value
			row.querySelectorAll('[data-column]:not([data-column=mins]').forEach((pv) => {
				let value = util.getValue(pv.innerText)
				let label = pv.dataset.column


				if(!Object.keys(data).includes(label)) {
					data[label] = value
					pv.classList.add('highlight')
				}

				else if(value >= data[label]) {

					if(value > data[label])
						document.querySelectorAll('[data-column="'+label+'"].highlight').forEach(e => e.classList.remove('highlight'))

					pv.classList.add('highlight')

					data[label] = value
				}

			})
		})
	}

	function sortable(row) {
		let data = {itmRef:row}
		row.querySelectorAll('[data-column]').forEach((elm) => {
			let name = elm.dataset.column
			data[name] = util.getValue(elm.innerText)
		})

		return data
	}

})
app.tablesort()
