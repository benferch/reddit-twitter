import { config } from './config';
import { timestamp } from './utils/DateFunctions';
import fetch from 'node-fetch';
import * as sharp from 'sharp';
import { createWriteStream } from 'fs';
require('dotenv').config();

const URL = 'http://backend:8081/';

function tweet() {
	console.log(`Next time tweeting: ${timestamp(config.interval)}.`);
	fetch(`${URL}getUnposted`)
		.then((res) => res.json())
		.then((data) => {
			const id = data[0].id,
				title = data[0].title,
				author = data[0].author,
				imageUrl = data[0].imageUrl,
				postUrl = data[0].postUrl;
			fetch(imageUrl).then((res) => {
				const dest = createWriteStream('./img/post.png');
				res.body.pipe(dest);
			});
			sharp('./img/post.png')
				.resize(1000)
				.toFile('./img/out.png', (err, info) => {
					if (err) {
						console.error(err);
					} else {
						console.info(info);
					}
				});
		});
	setTimeout(tweet, config.interval);
}

tweet();
