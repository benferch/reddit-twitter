/*
	config.ts

	------

	This is the config of the backend

	Properties:
	text = Should text posts be included | default: false
	interval = Time between requests in milliseconds | default: 1 hour
	limit = Amount of posts gathered | default: 50
*/

export const config = {
	text: false,
	interval: 3600000,
	limit: 50,
	utcOffset: +2,
};
