import { config } from './config';
import { timestamp } from './utils/DateFunctions';
import { createWriteStream, readFileSync, unlink } from 'fs';
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
//@ts-ignore This is fine
const Twitter = new Twit(SECRET);

function tweet() {
	fetch(`${URL}getUnposted`)
		.then((res) => res.json())
		.then((post) => {
			let title = post[0].title;
			const postId = post[0].id,
				author = post[0].author,
				imageUrl = post[0].imageUrl,
				postUrl = post[0].postUrl;
			fetch(imageUrl)
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
									let media = readFileSync('./img/out.png', {
										encoding: 'base64',
									});
									Twitter.post(
										'media/upload',
										{ media_data: media },
										(err, data, res) => {
											if (err) {
												console.error(err);
											} else {
												//@ts-ignore This is fine
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
																	if (!err) {
																		console.log(
																			`Post successfully tweeted\nNext time posting: ${timestamp(
																				config.interval
																			)}.`
																		);
																		fetch(`${URL}updatePosts`, {
																			headers: {
																				'Content-Type': 'application/json',
																			},
																			method: 'POST',
																			body: JSON.stringify({ id: postId }),
																		}).then((data) => {
																			console.log(
																				`Successfully updated post with id ${postId}`
																			);
																		});
																		unlink('./img/post.png', (err) => {
																			if (err) {
																				console.error(err);
																			}
																		});
																		unlink('./img/out.png', (err) => {
																			if (err) {
																				console.error(err);
																			}
																		});
																	} else {
																		console.error(err);
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
								}
							})
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

// tweet();
