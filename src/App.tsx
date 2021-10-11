import React, { useEffect, useState } from "react";
import axios from "axios";

import { createURL, calculateFreeHours } from "./util";
import { Classroom } from "./util";

//enrico gay

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

		axios.get(createURL(date as Date, address)).then((res) => {
			setClassrooms(res.data);
			console.log(res.data);
			setLoaded(true);
		});
	}, [date, address]);

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
										defaultValue={address}
										name="sede"
										onChange={(ev, newAddress) => setAddress(newAddress)}
									>
										<FormControlLabel
											value="MIA"
											control={<Radio />}
											label="Città Studi"
										/>
										<FormControlLabel
											value="MIA11"
											control={<Radio />}
											label="Piazza Leonardo, 26"
										/>
										<FormControlLabel
											value="MIA01"
											control={<Radio />}
											label="Piazza Leonardo, 32"
										/>
										<FormControlLabel
											value="MIA03"
											control={<Radio />}
											label="Via Bassini"
										/>
										<FormControlLabel
											value="MIA02"
											control={<Radio />}
											label="Via Bonardi"
										/>
										<FormControlLabel
											value="MIA06"
											control={<Radio />}
											label="Via Colombo, 40"
										/>
										<FormControlLabel
											value="MIA07"
											control={<Radio />}
											label="Via Colombo, 81"
										/>
										<FormControlLabel
											value="MIA14"
											control={<Radio />}
											label="Via Golgi, 20"
										/>
										<FormControlLabel
											value="MIA04"
											control={<Radio />}
											label="Via Golgi, 40"
										/>
										<FormControlLabel
											value="MIA05"
											control={<Radio />}
											label="Via Mancinelli"
										/>
										<FormControlLabel
											value="MIA15"
											control={<Radio />}
											label="Via Pascoli, 70"
										/>
										<FormControlLabel
											value="MIA09"
											control={<Radio />}
											label="Viale Romagna"
										/>
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
							{classrooms.map((classroom, i) => {
								if (
									i === 0 ||
									classroom.freeHours !== classrooms[i - 1].freeHours
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
