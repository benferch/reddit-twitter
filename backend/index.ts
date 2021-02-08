import express from 'express';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
require('dotenv').config();
import { config } from './config';
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
					PostModel.find({ id: el.data.id }, function (err, docs) {
						if (!docs.length) {
							Post.save().then(() => console.log('post'));
						} else {
							console.error(
								`Post with id ${el.data.id} exists \nError: ${err}`
							);
						}
					});
				}
			);
		});
}

getReddit();

// setTimeout(function () {}, config.interval);

app.get('/', (res: express.Response) => {
	res.send('Hello World!');
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
