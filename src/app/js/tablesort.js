app.tablesort = {
	init: async e => {

		if(document.querySelector('.player-stats')) {
			util.highlight()

			const containerRef = document.querySelector('.player-stats')
            containerRef.querySelector('.head').addEventListener('click', (e) => util.sortColumn(e, containerRef))
		}

	},
}
