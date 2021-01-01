module.exports = function alphabetize(postA, postB) {
	let a = postA.data.subreddit.toLowerCase(),
		b = postB.data.subreddit.toLowerCase();

	return a > b ? 1 : a < b ? -1 : 0;
};
