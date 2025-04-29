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

	getValue: (value) => {
		// MM:SS
		if((/^([0-9][0-9]):[0-5][0-9]$/).test(value)){
			// console.log('MM:SS', value)
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
		}
		else if (value.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/)) {
			const matchResult = value.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/)
			const day = matchResult[1];
			const month = matchResult[2];
			const year = matchResult[3];
			let dt = new Date(`${day}/${month}/${year}`)
			return dt.getTime()
		}
		else
			return parseFloat(value)
	}

}
