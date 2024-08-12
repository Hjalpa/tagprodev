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

	displayDate: (rawDate) => {
		const date = new Date(rawDate)
		const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear().toString()}`
	},

	timeAgo: (rawDate) => {
		const now = new Date()
		const diffInMs = now - new Date(rawDate)
		const diffInMinutes = Math.floor(diffInMs / 1000 / 60)
		const diffInHours = Math.floor(diffInMinutes / 60)
		const diffInDays = Math.floor(diffInHours / 24)

		if (diffInDays >= 30)
			return util.displayDate(rawDate)
		else if (diffInDays >= 1)
			return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
		else if (diffInHours >= 1)
			return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
		else if (diffInMinutes >= 1)
			return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
		else
			return 'just now'
	}

}

module.exports = util
