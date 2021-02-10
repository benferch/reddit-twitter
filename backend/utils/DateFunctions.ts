export function yesterday() {
	let d = new Date();
	d.setDate(d.getDate() - 1);
	return d;
}

export function timestamp(interval: number) {
	let d = new Date();
	return new Date(d.getTime() + interval).toLocaleString();
}
