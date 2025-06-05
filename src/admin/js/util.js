util = {
	indexInParent: (node) => {
	    var children = node.parentNode.childNodes
        num = 0

		for (var i=0; i<children.length; i++) {
			if (children[i]==node) return num
			if (children[i].nodeType==1) num++
		}

		return -1
	},

	findParentBySelector: (node, selector) => {
		while (node && node.parentNode) {
			let list = node.parentNode.querySelectorAll(selector)

			if(Array.prototype.includes.call(list, node))
				return node

			node = node.parentNode
		}

		return node | ''
	},

	getFormData: form => {
		const data = {};
		const inputs = form.querySelectorAll('input[name]')
		inputs.forEach(input => {
			data[input.name] = input.value
		})
		return data
	}
}
