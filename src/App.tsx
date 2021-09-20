import React, { useEffect, useState } from "react";
import axios from "axios";

import "./App.css";

const API_URL = "https://polimi-classroom-finder.herokuapp.com/";

interface Classroom {
	classroom: string;
	hours: number[];
	freeHours: number;
}

const App = () => {
	const [classrooms, setClassrooms] = useState(Array<Classroom>());

	useEffect(() => {
		axios.get(API_URL).then((res) => setClassrooms(res.data));
	}, []);

	return (
		<>
			<div className="main-container">
				{classrooms.map((classroom, i) => {
					if (i === 0 || classroom.freeHours !== classrooms[i - 1].freeHours) {
						// create header + element
						return (
							<>
								{createHeader(classroom.freeHours)}
								{createElement(classroom)}
							</>
						);
					}

					// create only element
					return <>{createElement(classroom)}</>;
				})}
			</div>
		</>
	);
};

const calculateFreeHours = (classroom: Classroom) => {
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

const createElement = (classroom: Classroom) => {
	return (
		<div className="classroom">
			{classroom.classroom}
			{classroom.freeHours !== 12 && (
				<div className="free-hours">
					{calculateFreeHours(classroom).map((el) => {
						return <p>{el}</p>;
					})}
				</div>
			)}
		</div>
	);
};

const createHeader = (hours: number) => {
	if (hours === 12) {
		return <h1>Aule libere per tutta la giornata 🎉</h1>;
	}

	return <h1>Aule libere per {hours} ore</h1>;
};

export default App;
