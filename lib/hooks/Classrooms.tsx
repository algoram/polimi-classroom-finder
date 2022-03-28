import { useEffect, useState } from 'react';
import useSWR from 'swr';

export type Classroom = {
  id: string;
  timetable: string[];
  location?: string;
  status: { message: string; class: string };
};

type BackendClassroom = {
  classroom: string;
  hours: number[];
  location?: string;
};

type RankedClassroom = {
  classroom: BackendClassroom;
  freeMin: number;
  busyMin: number;
};

const useClassrooms = (dateTime: Date) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const { data } = useSWR(createUrl(dateTime), fetcher);

  useEffect(() => {
    setClassrooms(getSortedClassrooms(data, dateTime));
  }, [data, dateTime]);

  return classrooms;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const createUrl = (d: Date) => {
  const dateString = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  return `${process.env.NEXT_PUBLIC_BACKEND_URL}?date=${dateString}`;
};

const minutesToHours = (min: number) => {
  const hour = Math.floor(min / 60);
  const minutes = min % 60;

  if (hour == 1 && minutes == 0) {
    return "un'altra ora";
  } else if (hour >= 1) {
    if (minutes >= 10) {
      return `altre ${hour}:${minutes} ore`;
    } else if (minutes != 0) {
      return `altre ${hour}:0${minutes} ore`;
    } else {
      return `altre ${hour} ore`;
    }
  } else if (minutes > 1) {
    return `altri ${minutes} minuti`;
  } else {
    return 'un altro minuto';
  }
};

const getSortedClassrooms = (data: BackendClassroom[], dateTime: Date) => {
  const scoredClassrooms: RankedClassroom[] = [];

  // when swr is loading, data is undefined
  if (data === undefined) return [];

  // get the scores for each classroom
  data.forEach((classroom) => {
    scoredClassrooms.push(getScore(classroom, dateTime));
  });

  // sort the classrooms base on the score
  scoredClassrooms.sort(
    (a, b) => b.freeMin - b.busyMin - a.freeMin + a.busyMin,
  );

  // retrieve classrooms, assign status message and class
  const classrooms: Classroom[] = scoredClassrooms.map((c) => {
    let statusMessage: string;
    let statusClass: string;

    if (c.busyMin === 0) {
      statusClass = 'free';
      statusMessage = `libera per ${minutesToHours(c.freeMin)}`;
    } else if (c.busyMin <= 30) {
      statusClass = 'soon-free';
      statusMessage = `occupata per ${minutesToHours(
        c.busyMin,
      )}, poi libera per ${minutesToHours(c.freeMin)}`;
    } else {
      statusClass = 'busy';
      statusMessage = `occupata per ${minutesToHours(c.busyMin)}`;
    }

    return {
      id: c.classroom.classroom,
      timetable: getTimeRanges(c.classroom.hours, dateTime),
      location: c.classroom.location,
      status: {
        message: statusMessage,
        class: statusClass,
      },
    };
  });

  return classrooms;
};

const quarterToTime = (q: number, baseTime: Date) => {
  const quarterHour = 15 * 60 * 1000; // 15 minutes in milliseconds

  return new Date(baseTime.getTime() + q * quarterHour);
};

const getScore = (classroom: BackendClassroom, dateTime: Date) => {
  const thisDay = new Date(
    dateTime.getFullYear(),
    dateTime.getMonth(),
    dateTime.getDate(),
  );

  const eightHours = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

  const baseTime = new Date(thisDay.getTime() + eightHours);

  const minutesDiff = (a: Date, b: Date) => {
    return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60));
  };

  let sum = 0;
  let i = 0;
  let busy = 0;
  let nextHour = quarterToTime(classroom.hours[0], baseTime);

  while (dateTime >= nextHour) {
    busy = 1 - busy; // toggle busy state
    sum += classroom.hours[i]; // move forward the time counter
    i++;

    nextHour = quarterToTime(sum + classroom.hours[i], baseTime);
  }

  let freeMin = 0;
  let busyMin = 0;

  if (busy) {
    busyMin = minutesDiff(nextHour, dateTime);

    // minutes threshold (ugly magic number)
    if (busyMin <= 30) {
      sum += classroom.hours[i++];

      freeMin = minutesDiff(
        quarterToTime(sum + classroom.hours[i], baseTime),
        nextHour,
      );
    }
  } else {
    freeMin = minutesDiff(nextHour, dateTime);
  }

  return {
    classroom,
    freeMin,
    busyMin,
  };
};

const getTimeRanges = (freeHours: number[], d: Date) => {
  const timetable: string[] = [];

  const printTime = (q: number) => {
    const hour = Math.floor(q / 4) + 8;
    const minutes = (q % 4) * 15;

    return `${hour}:${minutes === 0 ? '00' : minutes}`;
  };

  const q = (d.getHours() - 8) * 4 + Math.floor(d.getMinutes() / 15);

  let sum = 0;

  for (let i = 0; i < freeHours.length; i++) {
    if (i % 2 === 0) {
      if (sum <= q && q <= sum + freeHours[i]) {
        timetable.push(
          `> ${printTime(sum)} - ${printTime(sum + freeHours[i])}`,
        );
      } else {
        timetable.push(`${printTime(sum)} - ${printTime(sum + freeHours[i])}`);
      }
    }

    sum += freeHours[i];
  }

  return timetable;
};

export default useClassrooms;
