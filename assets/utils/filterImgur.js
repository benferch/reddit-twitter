module.exports = function filterImgur(images) {
	return images.filter(
		(p) => p.data.url.includes('imgur.com') && !p.data.url.includes('.jpg')
	);
};
