module.exports = function filterPngs(images) {
	return images.filter((p) => p.data.url.includes('.png'));
};
