require('dotenv').config();
const fetch = require('node-fetch');
const sharp = require('sharp');
const Twit = require('twit');
const config = require('./config');
const { colors } = require('./assets/colors');
const {
	subreddits: { subs },
} = require('./assets/subreddits');
const {
	utils: {
		alphabetize,
		filterImages,
		filterImgur,
		filterJpgs,
		filterPngs,
		filterTexts,
		generateImgurUrl,
		generateShortLinks,
		meta,
		minutes,
		sanitizeTitle,
		timestamp,
	},
} = require('./assets/utils');

const secret = {
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

const Twitter = new Twit(secret);
// Number of minutes between posts and updates;
const interval = minutes(config.interval);
// Number of posts to return
const limit = config.limit;
// Bot's twitter handle for timeline data
const screenName = config.screenName;
// Timezone offset (for logging fetches and tweets)
const utcOffset = config.utcOffset;

let queue = [];
let timeline = [];

console.log(colors.cyan, 'Next post: ', timestamp(utcOffset, interval));
/**
 * Converts raw buffer data to base64 string
 * @param {string} buffer Raw image data
 * @returns {string}
 */
function base64Encode(buffer) {
	if (buffer.byteLength > 5000000) {
		return resize(Buffer.from(buffer, 'base64'));
	}
	return Buffer.from(buffer).toString('base64');
}

/**
 * Filters the posts for images and texts that meet
 * the posting criteria
 * @param {array.<object>} posts An array of various subreddit posts
 * @returns {array}
 */
function filterPosts(posts) {
	let images, imgur, jpgs, pngs, texts;

	// Text only posts
	texts = filterTexts(posts);
	texts = meta(texts, 'text');
	// Image-based posts
	images = filterImages(posts);
	images = meta(images, 'image');
	// Gather up the image-based posts
	pngs = filterPngs(images);
	jpgs = filterJpgs(images);
	imgur = generateImgurUrl(filterImgur(images));
	// Update the queue with new posts
	queue.push(...pngs, ...jpgs, ...imgur, ...texts);

	return queue;
}

/**
 * Gets the next post in the queue
 * @returns {method}
 */
function getNextPost() {
	if (queue.length) {
		let post = queue.shift(),
			title = post.data.title;

		console.log(' ');
		console.log(colors.reset, 'Attempting to post...');
		console.log(title);
		console.log('queue length: ', queue.length);
		if (!timeline.some((t) => t.text.includes(title.substring(0, 25)))) {
			// Reset the queue after tweeting so that we're only tweeting
			// the most upvoted, untweeted post every interval
			queue = [];
			return tweet(post);
		}
		console.log('Already posted.');
		return getNextPost();
	}
	return;
}

/**
 * Gets the top posts from the subreddits
 * and replaces any problematic characters
 * in the posts' title
 * @returns {method}
 */
function getPosts() {
	let url = `https://www.reddit.com/r/${subs.join(
		'+'
	)}/top.json?limit=${limit}`;

	// List subs in query
	console.log(colors.yellow, 'Gathering new posts...');

	return fetch(url, { cache: 'no-cache' })
		.then((res) => res.json())
		.then((json) => {
			let posts = json.data.children;
			posts.forEach((p) => (p.data.title = sanitizeTitle(p.data.title)));
			return posts;
		})
		.catch((err) => console.log(colors.red, 'Error getPosts() ', err));
}

/**
 * Gathers post data, mutates it, then
 * gets Twitter timeline data
 * @returns {promise}
 */
function getPostsAndTimeline() {
	// Grab our data
	return new Promise((resolve, reject) => {
		getPosts()
			.then(filterPosts)
			.then((posts) => {
				// Process our post data
				queue = generateShortLinks(posts);
				queue = queue.sort(alphabetize).reverse();
			})
			.then(getTimeline)
			.then(resolve)
			.catch((err) =>
				console.log(colors.red, 'Error getPostsAndTimeline() ', err)
			);
	});
}

/**
 * Returns the 200 most recent tweets from the bot account
 * @returns {array.<object>}
 */
function getTimeline() {
	return new Promise((resolve, reject) => {
		let params = { screen_name: screenName, count: 200 };
		return Twitter.get('statuses/user_timeline', params, (err, data, res) => {
			timeline = data;
			return resolve();
		});
	});
}

/**
 * Resizes an image to 1000px wide so that
 * it will be under the 5mb limit Twitter requires
 * @param {string} buffer Raw image data
 * @returns {string}
 */
function resize(buffer) {
	return sharp(buffer)
		.resize(1000)
		.toBuffer()
		.then((data) => Buffer.from(data).toString('base64'))
		.catch((err) => console.log(colors.red, 'Error resize() ', err));
}

/**
 * Tweets a post based on it's `meta` prop
 * @param {object} post A single post from a subreddit
 * @returns {method}
 */
function tweet(post) {
	if (config.text == true) {
		switch (post.data.meta) {
			case 'text':
				return tweetText(post);
			case 'image':
				return tweetImage(post);
		}
	} else {
		switch (post.data.meta) {
			case 'text':
				console.log(colors.green, 'Only text found, skipped.');
				console.log(colors.cyan, 'Next post: ', timestamp(utcOffset, interval));
				return;
			case 'image':
				return tweetImage(post);
		}
	}
}

/**
 * Tweets an update to Twitter with an image
 * @param {object} post A post from a subreddit
 * @returns {undefined}
 */
function tweetImage(post) {
	fetch(post.data.url)
		.then((res) => res.arrayBuffer())
		.then(base64Encode)
		.then((res) => {
			let title = post.data.title;
			let author = post.data.author;

			Twitter.post('media/upload', { media_data: res }, (err, data, res) => {
				let mediaIdStr = data.media_id_string,
					meta_params = {
						media_id: mediaIdStr,
						alt_text: { text: title },
					};

				Twitter.post('media/metadata/create', meta_params, (err, data, res) => {
					if (!err) {
						let params = {
							status: `${title} \n/u/${author} \n \n ${post.data.shorty}`,
							media_ids: [mediaIdStr],
						};

						Twitter.post('statuses/update', params, (err, data, res) => {
							console.log(colors.green, 'Post successfully tweeted!');
							console.log(colors.green, timestamp(utcOffset));
							console.log(
								colors.cyan,
								'Next post: ',
								timestamp(utcOffset, interval)
							);
							console.log(' ');
							if (data.errors) console.log(colors.red, data);
						});
					} else {
						console.log(' ');
						console.log(
							colors.red,
							'There was an error when attempting to post...'
						);
						console.error(err);
						console.log(' ');
					}
				});
			});
		})
		.catch((err) => console.log(colors.red, 'Error tweet() ', err));
}

setInterval(() => getPostsAndTimeline().then(() => getNextPost()), interval);
