const app = {}

app.tablesort= (async () => {
	if(document.querySelector('.player-stats')) {
		await highlight()

		const containerRef = document.querySelector('.player-stats')
		if(document.querySelector('.player-stats [data-column="takeovers"]')) {
			items = [...containerRef.querySelectorAll('.row.entry')].map(item=>({
					mins : Number(item.querySelector('[data-column="mins"]').textContent),
					caps: Number(item.querySelector('[data-column="caps"]').textContent),
					assists: Number(item.querySelector('[data-column="assists"]').textContent),
					poss: util.getValue(item.querySelector('[data-column="poss"]').textContent),
					tags: Number(item.querySelector('[data-column="tags"]').textContent),
					takeovers: Number(item.querySelector('[data-column="takeovers"]').textContent),
					grabs: Number(item.querySelector('[data-column="grabs"]').textContent),
					hold: util.getValue(item.querySelector('[data-column="hold"]').textContent),
					chains: Number(item.querySelector('[data-column="chains"]').textContent),
					prevent: util.getValue(item.querySelector('[data-column="prevent"]').textContent),
					block: util.getValue(item.querySelector('[data-column="block"]').textContent),
					pups: Number(item.querySelector('[data-column="pups"]').textContent),
					itmRef : item,
				}))
		}
		else {
			items = [...containerRef.querySelectorAll('.row.entry')].map(item=>({
					mins : Number(item.querySelector('[data-column="mins"]').textContent),
					caps: Number(item.querySelector('[data-column="caps"]').textContent),
					hold: util.getValue(item.querySelector('[data-column="hold"]').textContent),
					grabs: Number(item.querySelector('[data-column="grabs"]').textContent),
					assists: Number(item.querySelector('[data-column="assists"]').textContent),
					prevent: util.getValue(item.querySelector('[data-column="prevent"]').textContent),
					returns: Number(item.querySelector('[data-column="returns"]').textContent),
					tags: Number(item.querySelector('[data-column="tags"]').textContent),
					kd: Number(item.querySelector('[data-column="kd"]').textContent),
					pups: Number(item.querySelector('[data-column="pups"]').textContent),
					itmRef : item,
				}))
		}

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

		// each row
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
})
app.tablesort()
