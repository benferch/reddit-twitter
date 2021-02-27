db.auth('root', 'root');

db = db.getSiblingDB('admin');

db.createUser({
	user: 'root',
	pwd: 'root',
	roles: [
		{
			role: 'userAdminAnyDatabase',
			db: 'admin',
		},
	],
});
