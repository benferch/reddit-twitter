import { config } from './config';
import { timestamp } from './utils/DateFunctions';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { createWriteStream } from 'fs';
require('dotenv').config();

const URL = 'http://backend:8081/';
const SECRET = {
	CONSUMER_KEY: process.env.CONSUMER_KEY,
	CONSUMER_SECRET: process.env.CONSUMER_SECRET,
	ACCESS_TOKEN: process.env.ACCESS_TOKEN,
	ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
};

async function tweet() {
	console.log(`Next time tweeting: ${timestamp(config.interval)}.`);
	await fetch(`${URL}getUnposted`)
		.then((res) => res.json())
		.then(async (data) => {
			const id = data[0].id,
				title = data[0].title,
				author = data[0].author,
				imageUrl = data[0].imageUrl,
				postUrl = data[0].postUrl;
			await fetch(imageUrl).then((res) => {
				const dest = createWriteStream('./img/post.png');
				res.body.pipe(dest).on('close', () =>
					sharp('./img/post.png')
						.resize(1000)
						.toFile('./img/out.png', (err, info) => {
							if (err) {
								console.error(err);
							} else {
								console.info(info);
							}
						})
				);
			});
		});
	setTimeout(tweet, config.interval);
}

tweet();
