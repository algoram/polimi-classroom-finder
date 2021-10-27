import React from "react";
import { FilterList } from "@mui/icons-material";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { locations } from "../util";
import itLocale from "date-fns/locale/it";

interface Props {
	date: Date | null;
	setDate: Function;
	dialogOpen: boolean;
	setDialogOpen: Function;
	address: string;
	setAddress: Function;
}

const FiltersComponent = (props: Props) => {
	return (
		<div className="filters-container">
			<LocalizationProvider dateAdapter={AdapterDateFns} locale={itLocale}>
				<DatePicker
					label="Scegli una data"
					value={props.date}
					onChange={(newDate) => props.setDate(newDate)}
					renderInput={(params) => <TextField {...params} />}
				/>
			</LocalizationProvider>
			<div className="btn-container">
				<Button
					variant="contained"
					endIcon={<FilterList />}
					onClick={() => props.setDialogOpen(true)}
				>
					Filtri
				</Button>
				<Dialog
					open={props.dialogOpen}
					onClose={() => props.setDialogOpen(false)}
					scroll="paper"
				>
					<DialogTitle>Scegli gli edifici da controllare</DialogTitle>
					<DialogContent dividers={true}>
						<FormControl component="fieldset">
							<FormLabel component="legend">Sede</FormLabel>
							<RadioGroup
								name="sede"
								onChange={(_, newAddress) => props.setAddress(newAddress)}
								value={props.address}
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
	);
};

export default FiltersComponent;
