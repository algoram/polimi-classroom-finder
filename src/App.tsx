import React, { useEffect, useState } from "react";
import axios from "axios";

import "./App.css";
import { createURL, calculateFreeHours } from "./util";
import { Classroom } from "./util";

const App = () => {
	const [classrooms, setClassrooms] = useState(Array<Classroom>());

	useEffect(() => {
		axios.get(createURL()).then((res) => setClassrooms(res.data));
	}, []);

	return (
		<>
			{classrooms.length === 0 ? (
				<div className="loading">
					<h1>Sto cercando delle aule vuote...</h1>
					<div className="loading-icon"></div>
				</div>
			) : (
				<div className="main-container">
					{classrooms.map((classroom, i) => {
						if (
							i === 0 ||
							classroom.freeHours !== classrooms[i - 1].freeHours
						) {
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
			)}
		</>
	);
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
