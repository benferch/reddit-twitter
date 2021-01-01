module.exports = function timestamp(offset, nextTweet = 0) {
	let d = new Date();

	d.setMinutes(d.getMinutes() + nextTweet / 60000);

	let utc = d.getTime() + d.getTimezoneOffset() * 60000,
		newD = new Date(utc + 3600000 * offset);

	return newD.toLocaleString();
};
