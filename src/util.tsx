export interface Classroom {
	classroom: string;
	hours: number[];
	freeHours: number;
	location: string;
}

const backend =
	process.env.NODE_ENV === "development"
		? "http://localhost:5000/"
		: "https://polimi-classroom-finder.herokuapp.com/";

export const createURL = (d?: Date, address?: string) => {
	let url = backend;

	const date = getDateString(d);
	const add = address ?? "MIA";

	url += `?date=${date}`;
	url += `&address=${add}`;

	return url;
};

export const getDateString = (d?: Date) => {
	const date = d ?? new Date();

	return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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

export const locations = [
	{ placeValue: "MIA", placeName: "Città Studi" },
	{
		placeValue: "Piazza Leonardo da Vinci 26",
		placeName: "Piazza Leonardo, 26",
	},
	{
		placeValue: "Piazza Leonardo da Vinci 32",
		placeName: "Piazza Leonardo, 32",
	},
	{ placeValue: "Via Bassini", placeName: "Via Bassini" },
	{ placeValue: "Via Bonardi", placeName: "Via Bonardi" },
	{ placeValue: "Via Colombo 40", placeName: "Via Colombo, 40" },
	{ placeValue: "Via Colombo 81", placeName: "Via Colombo, 81" },
	{ placeValue: "Via Golgi 20", placeName: "Via Golgi, 20" },
	{ placeValue: "Via Golgi 40", placeName: "Via Golgi, 40" },
	{ placeValue: "Via Mancinelli", placeName: "Via Mancinelli" },
	{ placeValue: "Via Pascoli 70", placeName: "Via Pascoli, 70" },
	{ placeValue: "Viale Romagna", placeName: "Viale Romagna" },
];

export const rankClassrooms = (
	classrooms: Classroom[],
	hourOfDay?: number
): Classroom[] => {
	// prendo l'ora attuale (8 AM corrisponde all'indice 0)
	let hour = (hourOfDay ?? new Date().getHours()) - 8;

	if (hour < 8 || hour > 20) {
		hour = 8;
	}

	return classrooms
		.map((classroom) => {
			const hourArray = generateHourArray(classroom);

			// resettiamo le freeHours, da ora le usiamo come "ore libere per il resto della giornata"
			classroom.freeHours = hourArray
				.slice(hour)
				.reduce((sum, h) => sum + h, 0);

			return classroom;
		})
		.sort((a, b) => b.freeHours - a.freeHours);
};

const generateHourArray = (c: Classroom) => {
	const hourArray = [];

	for (let i = 0; i < c.hours.length; i++) {
		for (let j = 0; j < c.hours[i]; j++) {
			hourArray.push(i % 2 === 0 ? 1 : 0);
		}
	}

	return hourArray;
};
