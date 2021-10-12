import React, { useEffect, useState } from "react";
import axios from "axios";

import { createURL, calculateFreeHours } from "./util";
import { Classroom } from "./util";

import "./App.css";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import {
	Button,
	Dialog,
	DialogTitle,
	TextField,
	DialogContent,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	ThemeProvider,
	createTheme,
	useMediaQuery,
} from "@mui/material";
import itLocale from "date-fns/locale/it";
import { FilterList } from "@mui/icons-material";

const locations = [
	{ placeValue: "MIA", placeName: "Città Studi" },
	{ placeValue: "Piazza Leonardo 26", placeName: "Piazza Leonardo, 26" },
	{ placeValue: "Piazza Leonardo 32", placeName: "Piazza Leonardo, 32" },
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

		axios.get(createURL(date as Date, locations[0].placeValue)).then((res) => {
			setClassrooms(res.data);
			console.log(res.data);
			setLoaded(true);
		});
	}, [date]);

	useEffect(() => {
		setDialogOpen(false);
	}, [address]);

	return (
		<ThemeProvider theme={theme}>
			<div className="page">
				<div className="filters-container">
					<LocalizationProvider dateAdapter={AdapterDateFns} locale={itLocale}>
						<DatePicker
							label="Scegli una data"
							value={date}
							onChange={(newDate) => setDate(newDate)}
							renderInput={(params) => <TextField {...params} />}
						/>
					</LocalizationProvider>
					<div className="btn-container">
						<Button
							variant="contained"
							endIcon={<FilterList />}
							onClick={() => setDialogOpen(true)}
						>
							Filtri
						</Button>
						<Dialog
							open={dialogOpen}
							onClose={() => setDialogOpen(false)}
							scroll="paper"
						>
							<DialogTitle>Scegli gli edifici da controllare</DialogTitle>
							<DialogContent dividers={true}>
								<FormControl component="fieldset">
									<FormLabel component="legend">Sede</FormLabel>
									<RadioGroup
										name="sede"
										onChange={(_, newAddress) => setAddress(newAddress)}
										value={address}
									>
										{locations.map(({ placeValue, placeName }) => (
											<FormControlLabel
												key={placeValue}
												value={placeValue}
												control={<Radio />}
												label={placeName}
											/>
										))}
									</RadioGroup>
								</FormControl>
							</DialogContent>
						</Dialog>
					</div>
				</div>
				{!loaded ? (
					<div className="loading">
						<h1>Sto cercando delle aule vuote...</h1>
						<div className="loading-icon"></div>
					</div>
				) : (
					<div>
						<div className="main-container">
							{classrooms
								.filter(
									(classroom) =>
										classroom.location === address ||
										address === locations[0].placeValue
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
					</div>
				)}
			</div>
		</ThemeProvider>
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

export default App;
