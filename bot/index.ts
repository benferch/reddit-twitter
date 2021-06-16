import { config } from './config';
import { timestamp } from './utils/DateFunctions';
import { createWriteStream, readFileSync, unlink } from 'fs';
import fetch from 'node-fetch';
import * as Sentry from '@sentry/node';
import sharp from 'sharp';
import Twit from 'twit';

const URL = 'http://backend:8081/';
const SECRET = {
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

Sentry.init({
	dsn: process.env.SENTRY_DSN_BOT ? process.env.SENTRY_DSN_BOT : '',

	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0,
	environment: process.env.SENTRY_ENV ? process.env.SENTRY_ENV : '',
});

sharp.cache(false);

Sentry.setUser({
	email: process.env.SENTRY_MAIL ? process.env.SENTRY_MAIL : '',
});

const transaction = Sentry.startTransaction({
	op: 'tweet',
	name: 'Tweet the reddit post',
});

Sentry.configureScope((scope) => {
	scope.setSpan(transaction);
});

//@ts-ignore This is fine
const Twitter = new Twit(SECRET);

function tweet() {
	try {
		fetch(`${URL}getUnposted`)
			.then((res) => res.json())
			.then((post) => {
				let title = post[0].title;
				let postId = post[0].id,
					author = post[0].author,
					imageUrl = post[0].imageUrl,
					postUrl = post[0].postUrl;
				fetch(imageUrl)
					.then((res) => {
						// Twitter video size: 2min 20 sec && 512mb && max res 1920x1200
						const dest = createWriteStream('./img/post.png');
						res.body.pipe(dest).on('close', () =>
							sharp('./img/post.png')
								.resize(1000)
								.toFile('./img/out.png', (err, info) => {
									if (err) {
										fetch(`${URL}updateError`, {
											headers: {
												'Content-Type': 'application/json',
											},
											method: 'POST',
											body: JSON.stringify({
												id: postId,
												errorMsg: err,
											}),
										});
										console.error(`There was an error with post ${postId}`);
									} else {
										console.info(info);
										let media = readFileSync('./img/out.png', {
											encoding: 'base64',
										});
										Twitter.post(
											'media/upload',
											{ media_data: media },
											(err, data, _res) => {
												if (err) {
													fetch(`${URL}updateError`, {
														headers: {
															'Content-Type': 'application/json',
														},
														method: 'POST',
														body: JSON.stringify({
															id: postId,
															errorMsg: err,
														}),
													});
													console.error(
														`There was an error with post ${postId}`
													);
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
														(err, _data, _res) => {
															if (!err) {
																let params = {
																	status: `${title}\nfrom /u/${author}\n\n${postUrl}`,
																	media_ids: [mediaIdStr],
																};
																Twitter.post(
																	'statuses/update',
																	params,
																	(err, _data, _res) => {
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
																			}).then((_data) => {
																				console.log(
																					`Successfully updated post with id ${postId}`
																				);
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
																			});
																		} else {
																			fetch(`${URL}updateError`, {
																				headers: {
																					'Content-Type': 'application/json',
																				},
																				method: 'POST',
																				body: JSON.stringify({
																					id: postId,
																					errorMsg: err,
																				}),
																			});
																			console.error(
																				`There was an error with post ${postId}`
																			);
																		}
																	}
																);
															} else {
																fetch(`${URL}updateError`, {
																	headers: {
																		'Content-Type': 'application/json',
																	},
																	method: 'POST',
																	body: JSON.stringify({
																		id: postId,
																		errorMsg: err,
																	}),
																});
																console.error(
																	`There was an error with post ${postId}`
																);
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
	} catch (err) {
		Sentry.captureException(err);
	} finally {
		transaction.finish();
	}
}

tweet();
