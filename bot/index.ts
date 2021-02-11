import fetch from 'node-fetch';
require('dotenv').config();
import { config } from './config';

const url = 'http://backend:8081/';

function getPosts() {
	return fetch(`${url}getUnposted`)
		.then((res) => res.json())
		.then((data) => {
			return data;
		});
}

getPosts().then((el) => console.log(el[0]));
