module.exports = function filterJpgs(images) {
	return images.filter((p) => p.data.url.includes('.jpg'));
};
