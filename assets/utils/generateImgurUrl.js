module.exports = function generateImgurUrl(posts) {
	return posts.map((p) => {
		let id = p.data.url.split('/')[3],
			url = p.data.url;

		p.data.url = url.includes('.jpg')
			? p.data.url
			: `https://i.imgur.com/${id}.jpg`;

		return p;
	});

	/* module.exports = function generateImgurUrl (posts) {
  return posts.map((p) => {
    let id = p.data.media.oembed.thumbnail_url.split('/')[3],
      url = p.data.media.oembed.thumbnail_url;
    p.data.url = url.includes('.jpg')
      ? p.data.url
      : `https://i.imgur.com/${id}`;
    return p;
  }); */
};
