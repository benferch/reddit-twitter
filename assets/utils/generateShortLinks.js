module.exports = function generateShortLinks(posts) {
	return posts.map((p) => {
		let shorty = p.data.permalink.split('/')[4];
		p.data.shorty = `https://redd.it/${shorty}`;
		return p;
	});
};
