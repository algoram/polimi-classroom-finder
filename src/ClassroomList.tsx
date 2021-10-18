import React from "react";
import { calculateFreeHours, Classroom, locations } from "./util";

interface Props {
	classrooms: Classroom[];
	address: string;
}

const ClassroomList = (props: Props) => {
	return (
		<div className="main-container">
			{props.classrooms
				.filter(
					(classroom) =>
						classroom.location === props.address ||
						props.address === locations[0].placeValue
				)
				.map((classroom, i, filteredClassrooms) => {
					if (
						i === 0 ||
						classroom.freeHours !== filteredClassrooms[i - 1].freeHours
					) {
						// create header + element
						return (
							<React.Fragment key={i}>
								{createHeader(classroom.freeHours)}
								{createElement(classroom)}
							</React.Fragment>
						);
					}

					// create only element
					return createElement(classroom);
				})}
		</div>
	);
};

const createElement = (classroom: Classroom) => {
	return (
		<div className="classroom" key={classroom.classroom}>
			{classroom.classroom}
			{classroom.freeHours !== 12 && (
				<div className="free-hours">
					{calculateFreeHours(classroom).map((el, index) => {
						return <p key={index}>{el}</p>;
					})}
				</div>
			)}
		</div>
	);
};

const createHeader = (hours: number) => {
	if (hours === 12) {
		return <h1 key={hours}>Aule libere per tutta la giornata 🎉</h1>;
	}

	return <h1 key={hours}>Aule libere per {hours} ore</h1>;
};

export default ClassroomList;
