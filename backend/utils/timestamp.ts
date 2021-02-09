export default function timestamp(offset: number, interval: number) {
	let d = new Date();

	d.setMinutes(d.getMinutes() + interval / 60000);

	let utc = d.getTime() + d.getTimezoneOffset() * 60000,
		newD = new Date(utc + 3600000 * offset);

	return newD.toLocaleString();
}
