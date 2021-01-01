module.exports = function generateVideoUrl(post) {
	let extension = /.gifv$/g,
		url = post.data.url;

	if (extension.test(url)) {
		post.data.url = url.slice(0, url.length - 5) + '.mp4';
	}

	return post;
};
