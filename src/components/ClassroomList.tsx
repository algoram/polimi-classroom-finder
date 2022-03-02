import React from 'react';
import {
  calculateFreeHours,
  Classroom,
  formatTime,
  locations,
  RankedClassroom,
} from '../util';

interface Props {
  rankedClassrooms: RankedClassroom[];
  address: string;
  hourOfDay: Date;
}

const ClassroomList = (props: Props) => {
  return (
    <div className="main-container">
      {props.rankedClassrooms
        .filter(
          (rankedClassroom) =>
            rankedClassroom.classroom.location === props.address ||
            props.address === locations[0].placeValue,
        )
        .map((rankedClassroom, index, filteredClassrooms) => {
          return createElement(rankedClassroom, props.hourOfDay);
          // if (rankedClassroom.busyMin === 0) {
          //   return (
          //     <div
          //       className="classroom"
          //       key={rankedClassroom.classroom.classroom}
          //     >
          //       <b>{rankedClassroom.classroom.classroom}</b> libera per{' '}
          //       {formatTime(rankedClassroom.freeMin)}
          //       <div className="free-hours">
          //         {calculateFreeHours(
          //           rankedClassroom.classroom,
          //           props.hourOfDay,
          //         ).map((el, index) => {
          //           return <p key={index}>{el.rangeString}</p>;
          //         })}
          //       </div>
          //     </div>
          //   );
          // } else if (rankedClassroom.busyMin <= 30) {
          //   return (
          //     <div
          //       className="classroom"
          //       key={rankedClassroom.classroom.classroom}
          //     >
          //       <b>{rankedClassroom.classroom.classroom}</b> occupata per{' '}
          //       {formatTime(rankedClassroom.busyMin)}, poi libera per{' '}
          //       {formatTime(rankedClassroom.freeMin)}
          //       {calculateFreeHours(
          //         rankedClassroom.classroom,
          //         props.hourOfDay,
          //       ).map((el, index) => {
          //         return <p key={index}>{el.rangeString}</p>;
          //       })}
          //     </div>
          //   );
          // } else {
          //   return (
          //     <div
          //       className="classroom"
          //       key={rankedClassroom.classroom.classroom}
          //     >
          //       <b>{rankedClassroom.classroom.classroom}</b> occupata per{' '}
          //       {formatTime(rankedClassroom.busyMin)}
          //       {calculateFreeHours(
          //         rankedClassroom.classroom,
          //         props.hourOfDay,
          //       ).map((el, index) => {
          //         return <p key={index}>{el.rangeString}</p>;
          //       })}
          //     </div>
          //   );
          // }
        })}
    </div>
  );
};

const createElement = (c: RankedClassroom, hourOfDay: Date) => {
  return (
    <div className="classroom" key={c.classroom.classroom}>
      <b>{c.classroom.classroom}</b>
      {c.busyMin === 0 ? ' libera' : ' occupata'} per{' '}
      {c.busyMin === 0 ? formatTime(c.freeMin) : formatTime(c.busyMin)}
      {c.busyMin !== 0 &&
        c.busyMin <= 30 &&
        `, poi libera per ${formatTime(c.freeMin)}`}
      {calculateFreeHours(c.classroom, hourOfDay).map((el, i) => {
        return (
          <p key={i}>
            {el.current ? (
              <span className="current-range">{el.rangeString}</span>
            ) : (
              el.rangeString
            )}
          </p>
        );
      })}
    </div>
  );
};

export default ClassroomList;
