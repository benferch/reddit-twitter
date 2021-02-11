export function timestamp(interval: number) {
	let d = new Date();
	return new Date(d.getTime() + interval).toLocaleString();
}
