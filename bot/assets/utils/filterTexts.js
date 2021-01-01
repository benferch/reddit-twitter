module.exports = function filterTexts(posts) {
	return posts.filter(
		(p) =>
			!p.data.is_video &&
			p.data.title.length <= 280 &&
			p.data.ups > 4000 &&
			p.data.is_self
	);
};
