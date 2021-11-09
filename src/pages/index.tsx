import React, { useEffect, useState } from "react";
import axios from "axios";

import { createURL, getDateString, locations, rankClassrooms } from "../util";
import { Classroom } from "../util";

import "../styles/index.css";
import { ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import FiltersComponent from "../components/Filters";
import ClassroomList from "../components/ClassroomList";
import SEO from "../components/seo";

const App = () => {
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

	const theme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? "dark" : "light",
				},
			}),
		[prefersDarkMode]
	);

	const [classrooms, setClassrooms] = useState(Array<Classroom>());
	const [date, setDate] = useState<Date | null>(new Date());
	const [dialogOpen, setDialogOpen] = useState(false);
	const [address, setAddress] = useState("MIA");
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setClassrooms([]);
		setDialogOpen(false);
		setLoaded(false);

		date === null && setDate(new Date());

		const cachedClassrooms: Classroom[] = JSON.parse(
			localStorage.getItem(getDateString())
		);

		if (cachedClassrooms !== null) {
			setClassrooms(rankClassrooms(cachedClassrooms));
			setLoaded(true);
		} else {
			axios
				.get(createURL(date as Date, locations[0].placeValue))
				.then((res) => {
					setClassrooms(rankClassrooms(res.data));
					console.log(res.data);
					setLoaded(true);
					localStorage.setItem(getDateString(), JSON.stringify(res.data));
				});
		}
	}, [date]);

	useEffect(() => {
		setDialogOpen(false);
	}, [address]);

	return (
		<>
			<SEO />
			<ThemeProvider theme={theme}>
				<div className="page">
					<FiltersComponent
						date={date}
						setDate={setDate}
						dialogOpen={dialogOpen}
						setDialogOpen={setDialogOpen}
						address={address}
						setAddress={setAddress}
					/>
					{!loaded ? (
						<div className="loading">
							<h1>Sto cercando delle aule vuote...</h1>
							<div className="loading-icon"></div>
						</div>
					) : (
						<div>
							<ClassroomList classrooms={classrooms} address={address} />
						</div>
					)}
				</div>
			</ThemeProvider>
		</>
	);
};

export default App;
