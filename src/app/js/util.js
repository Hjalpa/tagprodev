util = {

	indexInParent: function(node) {
	    var children = node.parentNode.childNodes
        num = 0

		for (var i=0; i<children.length; i++) {
			if (children[i]==node) return num
			if (children[i].nodeType==1) num++
		}

		return -1
	},

	findParentBySelector: function(node, selector) {
		while (node && node.parentNode) {
			var list = node.parentNode.querySelectorAll(selector)

			if(Array.prototype.includes.call(list, node))
				return node

			node = node.parentNode
		}

		return node | ''
	},

	insertAfter: function(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
	},

	getValue: value => {
		// MM:SS
		if ((/^([0-9][0-9]):[0-5][0-9]$/).test(value)) {
			let a = value.replace(':', '.')
			return parseFloat(a)
		}
		// HH:MM:SS
		else if (value.match(/\d+:[0-5]\d/)) {
			let a = value.split(':')
			return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
		}
		// %
		else if (value.match(/\d+:[0-5]\d/)) {
			let a = value.split('%')
			return a[0]
		} else if (value.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/)) {
			const matchResult = value.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/)
			const day = matchResult[1];
			const month = matchResult[2];
			const year = matchResult[3];
			let dt = new Date(`${day}/${month}/${year}`)
			return dt.getTime()
		} else if (value.match(/^(\d+)([smwhyd])\s+ago$/)) {
			const regexResult = /^(\d+)([smhdwym])\s+ago$/.exec(value);

			value = parseInt(regexResult[1], 10);
			const unit = regexResult[2];

			switch (unit) {
				case 's':
					return value;
				case 'm':
					return value * 60;
				case 'h':
					return value * 3600;
				case 'd':
					return value * 24 * 3600;
				case 'w':
					return value * 7 * 24 * 3600;
				case 'mth':
					// assume an average month is 30 days
					return value * 30 * 24 * 3600;
				case 'y':
					return value * 365 * 24 * 3600;
				default:
					return NaN;
			}
		} else if (typeof value === 'string') {
			return value
		} else {
			return parseFloat(value)
		}
	},

	sortColumn: (e, contain) => {

		function sortable(row) {
			let data = {
				itmRef: row
			}
			row.querySelectorAll('[data-column]').forEach((elm) => {
				let name = elm.dataset.column
				if (name === 'winrate') {
					data[name] = util.getValue(elm.innerText.replace('%', ''))
				} else if (name === 'form') {
					let resultElements = elm.querySelectorAll('.result')
					let score = 0;
					resultElements.forEach(function(result, index) {
						let winnerElement = result.querySelector('.winner')
						let loserElement = result.querySelector('.loser')
						if (winnerElement)
							score += 1.001 / (index + 1)
						else if (loserElement)
							score -= 1.001 / (index + 1)
					})
					data[name] = util.getValue(score.toString())
				} else
					data[name] = util.getValue(elm.innerText)
			})
			return data
		}

		let items = [...contain.querySelectorAll('.row.entry')].map(item => sortable(item))

		const col = util.findParentBySelector(e.target, '.row.head [data-column]')
		if (col) {
			const thead = util.findParentBySelector(e.target, '.row.head');
			const isAlreadyActive = col.classList.contains('active');

			// Remove active class from all head columns
			thead.querySelectorAll('.active').forEach(element => element.classList.remove('active'))

			// Toggle the sort order if clicking on the active column, otherwise set it to 'asc'
			col.dataset.sortby = isAlreadyActive ? (col.dataset.sortby === 'asc' ? 'desc' : 'asc') : 'asc';

			// if (!isAlreadyActive)
			col.classList.add('active');

			const column = col.dataset.column;
			const sortOrder = col.dataset.sortby === 'desc' ? -1 : 1;

			items.sort((a, b) => sortOrder * (
				(column === "name" || column === "map" || column === 'losername' || column === 'partner') ?
				a[column].localeCompare(b[column]) :
				a[column] - b[column]
			));

			// Preserve the head row
			const headRow = contain.querySelector('.row.head');

			// Clear the container and re-append head and sorted items
			contain.innerHTML = '';
			if (headRow) contain.appendChild(headRow);
			items.forEach(el => contain.appendChild(el.itmRef));
		}

	},

	highlight: async e => {
		let data = {};
		document.querySelectorAll('.row.entry').forEach((row) => {

			// each player value
			row.querySelectorAll('[data-column]:not([data-column=mins])').forEach((pv) => {
				let value = parseFloat(util.getValue(pv.innerText)); // Ensure it's a number
				let label = pv.dataset.column;

				if (!Object.keys(data).includes(label)) {
					data[label] = value;
					if (value > 0) {
						pv.classList.add('highlight');
					}
				} else if (value >= data[label]) {
					if (value > data[label]) {
						document.querySelectorAll('[data-column="' + label + '"].highlight').forEach(e => e.classList.remove('highlight'));
					}

					if (value > 0) {
						pv.classList.add('highlight');
					}

					data[label] = value;
				}

			});
		});
	},

}
