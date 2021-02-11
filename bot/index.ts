import fetch from 'node-fetch';
import { config } from './config';

const url = 'http://backend:8081/';

function getPosts() {
	return fetch(`${url}getUnposted`)
		.then((res) => res.json())
		.then((data) => {
			return data[0];
		});
}
