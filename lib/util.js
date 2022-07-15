const util = {

	isNumber: (str) => {
		if (typeof str != "string") return false // we only process strings!
		// could also coerce to string: str = ""+str
		return !isNaN(str) && !isNaN(parseFloat(str))
	},

    displayDate: (rawDate, output) => {
        const date = new Date(rawDate)
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const months = ['January', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const nth = (d) => {
            if (d > 3 && d < 21) return 'th';
            switch (d % 10) {
                case 1:  return "st";
                case 2:  return "nd";
                case 3:  return "rd";
                default: return "th";
            }
        }

        if(output === 'weekday')
            return weekDays[date.getDay()]
        else if(output === 'day month')
            return date.getDate() + ' ' + months[date.getMonth()]
        else if(output === 'weekday day month')
            return weekDays[date.getDay()] + ' ' + date.getDate() + nth(date.getDate()) + ' ' + months[date.getMonth()]
    },

}

module.exports = util
