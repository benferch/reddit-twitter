import express from 'express';
import mongoose from 'mongoose';
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
mongoose.connect(
	`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017`,
	{ useNewUrlParser: true, useUnifiedTopology: true }
);

const PostSchema = new mongoose.Schema({
	id: Number,
	title: String,
	author: String,
	ups: Number,
	imageUrl: String,
	timeAdded: Date,
	posted: Boolean,
});

const Post = mongoose.model('Post', PostSchema);

app.get('/', (res: express.Response) => {
	res.send('Hello World!');
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
