import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  createURL,
  getDateString,
  LocalStorageFile,
  locations,
  rankClassrooms,
} from '../util';
import { Classroom } from '../util';

import '../styles/index.css';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import FiltersComponent from '../components/Filters';
import ClassroomList from '../components/ClassroomList';
import SEO from '../components/seo';

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  const [cachedClassromData, setCachedClassromData] =
    useState<LocalStorageFile>();
  const [date, setDate] = useState<Date | null>(new Date());
  const classrooms = rankClassrooms(cachedClassromData?.classrooms ?? [], date);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [address, setAddress] = useState('MIA');
  const [loaded, setLoaded] = useState(false);

  console.log(cachedClassromData);

  useEffect(() => {
    setDialogOpen(false);
    setLoaded(false);
    date === null && setDate(new Date());
    const update = () => {
      axios
        .get(createURL(date as Date, locations[0].placeValue))
        .then((res) => {
          const tempCachedClassroom = LocalStorageFile.fromServer(res.data);
          console.log(res.data);
          setLoaded(true);
          localStorage.setItem(
            getDateString(),
            JSON.stringify(tempCachedClassroom),
          );

          setCachedClassromData(tempCachedClassroom);
        });
    };

    const tempString = localStorage.getItem(getDateString());

    if (tempString) {
      const tempCached = LocalStorageFile.fromCache(tempString);
      setCachedClassromData(tempCached);

      if (tempCached.checkValidity()) {
        setLoaded(true);

        (async () => update())();
      } else {
        console.log('usato dato dal server');
        update();
      }
    } else {
      console.log('usato dato dal server');
      update();
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
              <ClassroomList
                rankedClassrooms={classrooms}
                address={address}
                hourOfDay={date}
              />
            </div>
          )}
        </div>
      </ThemeProvider>
    </>
  );
};

export default App;
