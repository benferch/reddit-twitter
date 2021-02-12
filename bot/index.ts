import { config } from './config';
import { timestamp } from './utils/DateFunctions';
import { createWriteStream, readFileSync } from 'fs';
import fetch from 'node-fetch';
import sharp from 'sharp';
import Twit from 'twit';
require('dotenv').config();

const URL = 'http://backend:8081/';
const SECRET = {
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};
const Twitter = new Twit(SECRET);

async function tweet() {
	await fetch(`${URL}getUnposted`)
		.then((res) => res.json())
		.then(async (post) => {
			let title = post[0].title;
			const id = post[0].id,
				author = post[0].author, // max. 27
				imageUrl = post[0].imageUrl,
				postUrl = post[0].postUrl; // always 22 = 49 | 280 - 49 = 231 max title length
			if (title.length >= 230) {
				title = title.slice(0, title.length - 3).concat('...');
			}
			await fetch(imageUrl)
				.then((res) => {
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
					const media = readFileSync('./img/out.png', { encoding: 'base64' });
					Twitter.post(
						'media/upload',
						{ media_data: media },
						(err, data, res) => {
							if (err) {
								console.error(err);
							} else {
								//@ts-ignore This is ok
								let mediaIdStr = data.media_id_string,
									meta_params = {
										media_id: mediaIdStr,
										alt_text: { text: title },
									};
								Twitter.post(
									'media/metadata/create',
									meta_params,
									(err, data, res) => {
										if (!err) {
											let params = {
												status: `${title}\nfrom /u/${author}\n\n${postUrl}`,
												media_ids: [mediaIdStr],
											};
											Twitter.post(
												'statuses/update',
												params,
												(err, data, res) => {
													if (err) {
														console.error(err);
													} else {
														console.log(
															`Post successfully tweeted\nNext time posting: ${timestamp(
																config.interval
															)}.`
														);
														//@TODO: post fetch to update post status
													}
												}
											);
										} else {
											console.error(err);
										}
									}
								);
							}
						}
					);
				})
				.catch((err) => {
					console.error(err);
				});
		})
		.catch((err) => {
			console.error(err);
		});
	setTimeout(tweet, config.interval);
}

tweet();
