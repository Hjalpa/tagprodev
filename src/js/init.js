const app = {}

if(document.querySelector('.stats-records')) {
	let tabs = document.querySelector('.tabs')
	tabs.addEventListener('click', (e) => {
		e.preventDefault()

		let left = util.findParentBySelector(e.target, ".left")
		let right = util.findParentBySelector(e.target, ".right")

		let filter = []
		let link  = util.findParentBySelector(e.target, "a")

		if(left) {
			if(document.querySelector('.tabs .right .active').innerText === 'Low ELO')
				filter.push('elo=low')

			if(link.hasAttribute('data-param'))
				filter.push(link.dataset.param)
		}
		else if (right) {
			if(document.querySelector('.tabs .left .active').innerText === 'Season 2')
				filter.push('season=2')
			else if(document.querySelector('.tabs .left .active').innerText === 'Season 1')
				filter.push('season=1')

			if(link.hasAttribute('data-param'))
				filter.push(link.dataset.param)
		}

		let url = window.location.origin + window.location.pathname
		if(filter.length > 0)
			url = url + '?' + filter.join('&')

		window.location.href = url
	})
}
