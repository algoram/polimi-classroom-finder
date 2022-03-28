import { Classroom } from '../hooks/Classrooms';

interface Props {
  classrooms: Classroom[];
}

const ClassroomList = (props: Props) => {
  return (
    <div className="list">
      {props.classrooms.map((classroom) => {
        return (
          <div className="classroom" key={classroom.id}>
            <h3 className={classroom.status.class}>
              <span className="name">{classroom.id}</span>{' '}
              {classroom.status.message}
            </h3>
            <div className="timetable">
              {classroom.timetable.map((timeRange, i) => {
                const selected = timeRange.startsWith('>');

                return (
                  <p
                    className={selected ? 'selected' : ''}
                    key={`${classroom.id}${i}`}
                  >
                    {timeRange}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClassroomList;
