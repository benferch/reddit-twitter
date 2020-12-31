db.auth('root', 'root');

db = db.getSiblingDB('bot');

db.createUser({
	user: 'bot_user',
	pwd: 'bot_pw',
	roles: [
		{
			role: 'readWrite',
			db: 'bot',
		},
	],
});

db.posts.insert({
	id: 0,
	author: 'john',
	title: 'Lorem ipsum',
	upvotes: '420',
	imageUrl: 'redd.it/asdiio',
	timeAdded: new Date(),
	posted: false,
});
