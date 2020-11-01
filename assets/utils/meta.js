module.exports = function meta(posts, type) {
	posts.forEach((p) => (p.data.meta = type));
	return posts;
};
