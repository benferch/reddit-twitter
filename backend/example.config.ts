/*
	config.ts

	------

	This is the config of the backend

	Properties:
	text = Should text posts be included | default: false
	requestInterval = Time between requests in milliseconds | default: 1 hour (3600000) 
	deleteInterval = Time between deletion of posts in database | default: 1 day (86400000)
	limit = Amount of posts gathered | default: 100 (maximum: 100)
	minUpvotes = Minimum amount of upvotes | default: false
	amountUpvotes = Amount of upvotes | default: 100
*/

export const config = {
	text: false,
	requestInterval: 3600000,
	deleteInterval: 86400000,
	limit: 100,
	minUpvotes: false,
	amountUpvotes: 100,
};
