import bodyParser from 'body-parser';
import { config } from './config';
import express from 'express';
import { timestamp, yesterday } from './utils/DateFunctions';
require('dotenv').config();
import mongoose from 'mongoose';
import fetch, { Headers } from 'node-fetch';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
const {
	subreddits: { subs },
} = require('./subreddits');

const url = `https://www.reddit.com/r/${subs.join('+')}/top.json?limit=${
	config.limit
}`;

const app = express();
const port = 8081;

Sentry.init({
	dsn: process.env.SENTRY_DSN,

	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0,
	integrations: [new Tracing.Integrations.Mongo()],
	environment: process.env.ENV,
});

const transaction = Sentry.startTransaction({
	op: 'Get posts and store',
	name: 'Get posts from reddit and store them in the database',
});

Sentry.setUser({ email: process.env.SENTRY_MAIL });

Sentry.configureScope((scope) => {
	scope.setSpan(transaction);
});

mongoose
	.connect(
		`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@db:27017/bot?authSource=admin`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.catch((e) => console.error(e));

mongoose.connection.on('error', (err) => {
	console.error(err);
});

const PostSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			unique: true,
		},
		title: String,
		author: String,
		upvotes: Number,
		imageUrl: String,
		postUrl: String,
		timeAdded: Date,
		posted: Boolean,
	},
	{ versionKey: false }
);

const PostModel = mongoose.model('Post', PostSchema);

function getReddit() {
	try {
		console.log(
			`Next time getting posts: ${timestamp(config.requestInterval)}.`
		);
		fetch(url)
			.then((res) => res.json())
			.then((data) => {
				data.data.children.forEach(
					(el: {
						data: {
							id: String;
							title: String;
							author: String;
							selftext: String;
							ups: Number;
							url: String;
							secure_media: {
								reddit_video: {
									fallback_url: String;
								};
							};
						};
					}) => {
						if (
							el.data.selftext === '' ||
							!el.data.url.includes('https://youtu.be') ||
							!el.data.url.includes('https://www.youtu.be')
						) {
							let title = el.data.title;
							if (el.data.title.length >= 230) {
								title = title.slice(0, title.length - 3).concat('...');
							}
							let imageUrl = el.data.url;
							if (
								imageUrl.includes('https://imgur.com/') ||
								imageUrl.includes('https://www.imgur.com/')
							) {
								if (!imageUrl.endsWith('.png') || !imageUrl.endsWith('.jpg')) {
									if (
										imageUrl.includes('https://imgur.com/a/') ||
										imageUrl.includes('https://www.imgur.com/a/')
									) {
										let ID = imageUrl.split('/')[4];
										fetch(`https://api.imgur.com/3/album/${ID}/images`, {
											method: 'GET',
											headers: new Headers({
												Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
											}),
										})
											.then((res) => res.json())
											.then((data) => {
												imageUrl = data.data[0].link;
											});
									} else if (
										imageUrl.includes('https://imgur.com/gallery') ||
										imageUrl.includes('https://www.imgur.com/gallery')
									) {
										let ID = imageUrl.split('/')[4];
										fetch(`https://api.imgur.com/3/gallery/album/${ID}`, {
											method: 'GET',
											headers: new Headers({
												Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
											}),
										})
											.then((res) => res.json())
											.then((data) => {
												imageUrl = data.data.images[0].link;
											});
									}
								}
							} else if (!imageUrl.includes('https://v.redd.it/')) {
								const Post = new PostModel({
									id: el.data.id,
									title: title,
									author: el.data.author,
									upvotes: el.data.ups,
									imageUrl: imageUrl,
									postUrl: `https://redd.it/${el.data.id}`,
									timeAdded: Date.now(),
									posted: false,
								});
								PostModel.find({ id: el.data.id }, function (err: Error, docs) {
									if (err) {
										console.error(err);
									} else {
										if (!docs.length) {
											Post.save().then(() => {
												console.info(`Posted post with id ${el.data.id}.`);
											});
										} else {
											console.error(
												`Post with id ${el.data.id} already exists.`
											);
										}
									}
								});
							}
						}
					}
				);
			});
		setTimeout(getReddit, config.requestInterval);
	} catch (err) {
		Sentry.captureException(err);
	} finally {
		transaction.finish();
	}
}

getReddit();

function deletePosted() {
	console.log(`Next time deleting posts: ${timestamp(config.deleteInterval)}.`);
	PostModel.find(
		{ posted: true, timeAdded: { $gte: new Date(+0), $lte: yesterday() } },
		(err: Error, result) => {
			if (err) {
				console.error(err);
			} else {
				result.forEach((e) => {
					PostModel.deleteOne({ id: e.id }).then(() =>
						console.info(`Deleted post with id ${e.id}.`)
					);
				});
			}
		}
	);
	setTimeout(deletePosted, config.deleteInterval);
}

deletePosted();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//@ts-ignore: This is fine
app.get('/', (req: express.Request, res: express.Response) => {
	res.status(200).json({
		title: 'Twitter Bot Backend',
		endpoints: [
			{ endpoint: '/posts', description: 'Get posts from database.' },
			{ endpoint: '/updatePost', description: 'Update post information' },
			{
				endpoint: '/getUnposted',
				description: 'Get unposeted posts from database',
			},
		],
	});
});

//@ts-ignore: This is fine
app.get('/posts', (req: express.Request, res: express.Response) => {
	PostModel.find({}, (err: Error, result) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(result);
		}
	});
});

//@ts-ignore: This is fine
app.get('/getUnposted', (req: express.Request, res: express.Response) => {
	PostModel.find({ posted: false }, (err: Error, result) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(result);
		}
	});
});

app.post('/updatePosts', (req: express.Request, res: express.Response) => {
	if (!req.body.id) {
		res.status(400).send('No id given');
	} else {
		PostModel.updateOne({ id: req.body.id }, { posted: true }).then(() =>
			res.status(200).send(`Updated post with id ${req.body.id}.`)
		);
	}
});

app.listen(port, () => {
	console.info(`Backend listening at http://localhost:${port}`);
});
