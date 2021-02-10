import express from 'express';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
require('dotenv').config();
import { config } from './config';
import { timestamp, yesterday } from './utils/DateFunctions';
const {
	subreddits: { subs },
} = require('./subreddits');

const url = `https://www.reddit.com/r/${subs.join('+')}/top.json?limit=${
	config.limit
}`;

const app = express();
const port = 8081;

mongoose
	.connect(
		`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@db:27017/bot?authSource=admin`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.catch((e) => console.error(e));

mongoose.connection.on('error', (err) => {
	console.error(err);
});

const PostSchema = new mongoose.Schema({
	id: String,
	title: String,
	author: String,
	upvotes: Number,
	imageUrl: String,
	timeAdded: Date,
	posted: Boolean,
});

const PostModel = mongoose.model('Post', PostSchema);

function getReddit() {
	console.log(`Next time getting posts: ${timestamp(config.requestInterval)}.`);
	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			data.data.children.forEach(
				(el: {
					data: {
						id: String;
						title: String;
						author: String;
						ups: Number;
						url: String;
					};
				}) => {
					const Post = new PostModel({
						id: el.data.id,
						title: el.data.title,
						author: el.data.author,
						upvotes: el.data.ups,
						imageUrl: el.data.url,
						timeAdded: Date.now(),
						posted: false,
					});
					PostModel.find({ id: el.data.id }, function (err: Error, docs) {
						if (err) {
							console.error(err);
						} else {
							if (!docs.length) {
								Post.save().then(() =>
									console.log(`Posted Post with id ${el.data.id}.`)
								);
							} else {
								console.error(`Post with id ${el.data.id} already exists.`);
							}
						}
					});
				}
			);
		});
	setTimeout(getReddit, config.requestInterval);
}

getReddit();

function deletePosted() {
	console.log(`Next time deleting posts: ${timestamp(config.deleteInterval)}.`);
	PostModel.find(
		{ posted: false, timeAdded: { $gte: new Date(+0), $lte: yesterday() } },
		(err: Error, result) => {
			if (err) {
				console.error(err);
			} else {
				result.forEach((e) => {
					PostModel.deleteOne({ id: e.id }).then(() =>
						console.log(`Deleted Post with id ${e.id}.`)
					);
				});
			}
		}
	);
	setTimeout(deletePosted, config.deleteInterval);
}

deletePosted();

//@ts-ignore: This is fine
app.get('/', (req: express.Request, res: express.Response) => {
	res.status(200).json({
		title: 'Twitter Bot Backend',
		endpoints: [
			{ endpoint: '/posts', description: 'Get posts from database.' },
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

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
