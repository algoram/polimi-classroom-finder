import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { NextPage } from 'next';
import { useMemo, useState } from 'react';
import useClassrooms from '../lib/hooks/Classrooms';
import { DateTimePicker } from '@mui/lab';
import itLocale from 'date-fns/locale/it';
import {
  createTheme,
  TextField,
  ThemeProvider,
  useMediaQuery,
} from '@mui/material';
import ClassroomList from '../lib/components/ClassroomList';

const Index: NextPage = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  const [dateTime, setDateTime] = useState(new Date());
  const classrooms = useClassrooms(dateTime);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={itLocale}>
        <DateTimePicker
          label="Scegli una data"
          value={dateTime}
          onChange={(newDate) => setDateTime(newDate!)}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
      <ClassroomList classrooms={classrooms} />
    </ThemeProvider>
  );
};

export default Index;
