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

/*

MIA		=> Città Studi
MIA11	=> Piazza Leo 26 (29)
MIA01	=> Piazza Leo 32 (1, 10, 2, 2A, 3, 4, 4A, 5, 6, 7, 8, 9, 9A, CT1)
MIA03 => Via Bassini (19, 19B, 19C, 20, 21, 36, 36A, 37, 42, 43, CT2, CT7)
MIA02 => Via Bonardi (11B, 11, 12, 13, 14, 14A, 14B, 15, 16A, 16B, 16C, 18)
MIA06 => Via Colombo 40 (32.1, 32.2, 32.3, 32.4, 32.5)
MIA07 => Via Colombo 81 (30)
MIA14 => Via Golgi 20 (26, 27)
MIA04 => Via Golgi 40 (22, 23, 24, 25)
MIA05 => Via Mancinelli (28)
MIA15 => Via Pascoli 70 (38, 39, 40)
MIA09 => Viale Romagna (Casa dello Studente)

*/
export const createURL = (d?: Date, address?: string) => {
	let url = backend;

	const date = d ?? new Date();
	const add = address ?? "MIA";

	url += `?date=${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	url += `&address=${add}`;

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
