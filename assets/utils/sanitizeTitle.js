module.exports = function sanitizeTitle(title) {
	return (title = title
		.replace(/\b\.\b/g, '. ')
		.replace(/&amp;/g, 'and')
		.replace(/&gt;/g, '>')
		.replace(/&lt;/g, '<')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/“/g, '"')
		.replace(/”/g, '"')
		.replace(/‘/g, "'")
		.replace(/’/g, "'")
		.replace(/`/g, "'")
		.replace(/&mdash;/g, '-')
		.replace(/&ndash;/g, '-')
		.replace(/ - /g, ' - ')
		.replace(/&hellip;/g, '...')
		.replace(/&/g, 'and'));
};
