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
	}

}
