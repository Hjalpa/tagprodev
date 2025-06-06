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
		const inputs = form.querySelectorAll('input[name], select[name], textarea[name]');

		inputs.forEach(input => {
			if (input.type === 'radio') {
				if (input.checked) {
					data[input.name] = input.value;
				}
			} else if (input.type === 'checkbox') {
				if (!data[input.name]) {
					data[input.name] = [];
				}
				if (input.checked) {
					data[input.name].push(input.value);
				}
			} else {
				data[input.name] = input.value;
			}
		});

		// Convert single-value checkbox arrays to single value if only one box in group
		for (const name in data) {
			if (Array.isArray(data[name]) && data[name].length === 1) {
				data[name] = data[name][0];
			}
		}

		return data;
	}

}
