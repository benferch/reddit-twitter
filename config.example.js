const settings = {
	// Only Media posts, or Media and Text posts
	text: false,
	// Number of minutes between posts and updates;
	interval: 30,
	// Number of posts to return
	limit: 50,
	// Bot's twitter handle for timeline data
	screenName: 'r_mkeyboards',
	// Direct message errors -> true: send messages, false: send no messages
	dmErrors: true,
	// Admin of the bot to direct message errors ! YOU HAVE TO USE THE ID OF THE ACCOUNT OTHERWISE IT WON'T WORK (To get the ID you could use http://gettwitterid.com/ for example!
	admin: '1264353446611877888',
	// Timezone offset (for logging fetches and tweets)
	utcOffset: +2,
};

module.exports = settings;
