const util = {

	getDaysArray: (s, e) => {
		for(var a=[],d=new Date(s);d<=e;d.setDate(d.getDate()+1)){ a.push(util.formatDate(new Date(d)));}return a;
	},

	formatDate: (date) => {
		var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2)
			month = '0' + month
		if (day.length < 2)
			day = '0' + day

		return [year, month, day].join('-')
	},

}

module.exports = util
