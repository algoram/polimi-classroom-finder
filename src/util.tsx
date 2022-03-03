export interface Classroom {
  classroom: string;
  hours: number[];
  location: string;
}

export interface RankedClassroom {
  classroom: Classroom;
  freeMin: number;
  busyMin: number;
}

export interface FreeTimeRange {
  rangeString: string;
  current: boolean;
}

export class LocalStorageFile {
  expire: number;
  classrooms: Classroom[];
  version: string;

  static readonly actualVersion = '0';
  static readonly timeToExpire = 3 * 60 * 60 * 1000;

  static fromCache(value: string) {
    const newLocalStorage = new LocalStorageFile();
    const parsed = JSON.parse(value);

    newLocalStorage.expire = parsed.expire;
    newLocalStorage.classrooms = parsed.classrooms;
    newLocalStorage.version = parsed.version;

    return newLocalStorage;
  }

  static fromServer(classroms: Classroom[]) {
    const newLocalStorage = new LocalStorageFile();

    newLocalStorage.classrooms = classroms;
    newLocalStorage.version = this.actualVersion;
    newLocalStorage.expire = Date.now() + this.timeToExpire;

    return newLocalStorage;
  }

  private constructor() {}

  checkValidity() {
    console.log(
      'checkValidity',
      this.version,
      LocalStorageFile.actualVersion,
      this.version !== LocalStorageFile.actualVersion,
    );

    if (
      typeof this.expire === 'undefined' ||
      this.expire > Date.now() + LocalStorageFile.timeToExpire ||
      this.version !== LocalStorageFile.actualVersion ||
      typeof this.classrooms !== 'object'
    ) {
      console.log('wtf');

      return false;
    }

    return true;
  }
}

const backend =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/'
    : 'https://polimi-classroom-finder.herokuapp.com/';

export const createURL = (d?: Date, address?: string) => {
  let url = backend;

  const date = getDateString(d);
  const add = address ?? 'MIA';

  url += `?date=${date}`;
  url += `&address=${add}`;

  return url;
};

export const getDateString = (d?: Date) => {
  const date = d ?? new Date();

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export const locations = [
  { placeValue: 'MIA', placeName: 'Città Studi' },
  {
    placeValue: 'Piazza Leonardo da Vinci 26',
    placeName: 'Piazza Leonardo, 26',
  },
  {
    placeValue: 'Piazza Leonardo da Vinci 32',
    placeName: 'Piazza Leonardo, 32',
  },
  { placeValue: 'Via Bassini', placeName: 'Via Bassini' },
  { placeValue: 'Via Bonardi', placeName: 'Via Bonardi' },
  { placeValue: 'Via Colombo 40', placeName: 'Via Colombo, 40' },
  { placeValue: 'Via Colombo 81', placeName: 'Via Colombo, 81' },
  { placeValue: 'Via Golgi 20', placeName: 'Via Golgi, 20' },
  { placeValue: 'Via Golgi 40', placeName: 'Via Golgi, 40' },
  { placeValue: 'Via Mancinelli', placeName: 'Via Mancinelli' },
  { placeValue: 'Via Pascoli 70', placeName: 'Via Pascoli, 70' },
  { placeValue: 'Viale Romagna', placeName: 'Viale Romagna' },
];

const quarterToDate = (quarter: number, hourOfDay: Date) => {
  return new Date(
    hourOfDay.getFullYear(),
    hourOfDay.getMonth(),
    hourOfDay.getDate(),
    Math.floor(quarter / 4),
    (quarter % 4) * 15,
  );
};

export const calculateFreeHours = (
  classroom: Classroom,
  hourOfDay: Date,
): FreeTimeRange[] => {
  const quarterToTime = (quarter: number) => {
    let time = Math.floor(quarter / 4).toString();

    switch (quarter % 4) {
      case 0:
        time += ':00';
        break;

      case 1:
        time += ':15';
        break;

      case 2:
        time += ':30';
        break;

      case 3:
        time += ':45';
        break;
    }

    return time;
  };

  const freeHours: FreeTimeRange[] = [];

  let start = 8 * 4;

  classroom.hours.forEach((hours, i) => {
    if (i % 2 === 0 && hours > 0) {
      const startTime = quarterToTime(start);
      const endTime = quarterToTime(start + hours);

      freeHours.push({
        rangeString: `${startTime} - ${endTime}`,
        current:
          quarterToDate(start, hourOfDay) < hourOfDay &&
          hourOfDay < quarterToDate(start + hours, hourOfDay),
      });
    }

    start += hours;
  });

  return freeHours;
};

export const formatTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;

  if (hour == 1 && min == 0) {
    return "un'altra ora";
  } else if (hour >= 1) {
    if (min >= 10) {
      return `altre ${hour}:${min} ore`;
    } else if (min != 0) {
      return `altre ${hour}:0${min} ore`;
    } else {
      return `altre ${hour} ore`;
    }
  } else if (min > 1) {
    return `altri ${min} minuti`;
  } else {
    return 'un altro minuto';
  }
};

// calculates a score based on the number of minutes which the classroom is not busy for
export const rankClassrooms = (
  classrooms: Classroom[],
  hourOfDay: Date = new Date(),
  soonFreeThreshold: number = 30,
): RankedClassroom[] => {
  const minutesDiff = (a: Date, b: Date) => {
    return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60));
  };

  const ranking: RankedClassroom[] = [];

  classrooms.forEach((classroom, index) => {
    let busy = 0;
    let time = 8 * 4; // we start at 8 AM
    let i = 0;

    while (hourOfDay >= quarterToDate(time + classroom.hours[i], hourOfDay)) {
      busy = 1 - busy; // toggle busy state
      time += classroom.hours[i]; // move forward the time counter
      i++;
    }

    let freeMin = 0;
    let busyMin = 0;

    if (busy === 1) {
      busyMin = minutesDiff(
        quarterToDate(time + classroom.hours[i], hourOfDay),
        hourOfDay,
      );

      if (busyMin <= soonFreeThreshold) {
        time += classroom.hours[i++];

        freeMin = minutesDiff(
          quarterToDate(time + classroom.hours[i], hourOfDay),
          quarterToDate(time, hourOfDay),
        );
      }
    } else {
      freeMin = minutesDiff(
        quarterToDate(time + classroom.hours[i], hourOfDay),
        hourOfDay,
      );
    }

    ranking.push({ classroom, freeMin, busyMin });
  });

  return ranking.sort((a, b) => b.freeMin - b.busyMin - a.freeMin + a.busyMin);
};

const generateHourArray = (c: Classroom) => {
  const hourArray = [];

  for (let i = 0; i < c.hours.length; i++) {
    for (let j = 0; j < c.hours[i]; j++) {
      hourArray.push(i % 2 === 0 ? 1 : 0);
    }
  }

  return hourArray;
};
