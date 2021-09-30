export interface Classroom {
	classroom: string;
	hours: number[];
	freeHours: number;
}

export const createURL = (d?: Date) => {
	let url = "https://polimi-classroom-finder.herokuapp.com/";

	const date = d ?? new Date();

	url += `?date=${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

	return url;
};

export const calculateFreeHours = (classroom: Classroom) => {
	const freeHours: string[] = [];

	let start = 8;

	classroom.hours.forEach((hours, i) => {
		if (i % 2 === 0 && hours > 0) {
			freeHours.push(`${start}:15 - ${start + hours}:15`);
		}

		start += hours;
	});

	return freeHours;
};
