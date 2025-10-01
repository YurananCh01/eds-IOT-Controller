import React, { useState } from 'react';
import './TimerTable.css';

type TimerRow = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  days: { [key: string]: boolean }; 
};

const TimerTable: React.FC = () => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [timers, setTimers] = useState<TimerRow[]>([
    { id: 1, name: 'Siam Discovery', startTime: '', endTime: '', days: Object.fromEntries(daysOfWeek.map(d => [d, false])) },
  ]);
  const handleDayChange = (id: number, day: string) => {
    setTimers(prev =>
      prev.map(timer =>
        timer.id === id
          ? { ...timer, days: { ...timer.days, [day]: !timer.days[day] } }
          : timer
      )
    );
  };
  const handleChange = (
    id: number,
    field: keyof TimerRow,
    value: string
  ) => {
    setTimers(prev =>
      prev.map(timer =>
        timer.id === id ? { ...timer, [field]: value } : timer
      )
    );
  };

  const addRow = () => {
    const newId = timers.length > 0 ? timers[timers.length - 1].id + 1 : 1;
    setTimers([
      ...timers,
      { id: newId, name: '', startTime: '', endTime: '',days: Object.fromEntries(daysOfWeek.map(d => [d, false])) },
    ]);
  };

  const removeRow = (id: number) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  return (
    <div className="timer-table-container">
      <h2>ตารางตั้งค่า Timer</h2>
      <table className="timer-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ชื่อกลุ่ม</th>
            <th>เวลาเปิด</th>
            <th>เวลาปิด</th>
            <th>สัปดาห์</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {timers.map((timer, index) => (
            <tr key={timer.id}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="text"
                  value={timer.name}
                  placeholder="ชื่ออุปกรณ์"
                  onChange={e => handleChange(timer.id, 'name', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={timer.startTime}
                  onChange={e => handleChange(timer.id, 'startTime', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={timer.endTime}
                  onChange={e => handleChange(timer.id, 'endTime', e.target.value)}
                />
              </td>
              <td>
                  {daysOfWeek.map(day => (
                  <label key={day} style={{ marginRight: "6px" }}>
                    <input
                      type="checkbox"
                      checked={timer.days[day]}
                      onChange={() => handleDayChange(timer.id, day)}
                    />{" "}
                    {day}
                  </label>
                ))}
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => removeRow(timer.id)}
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-btn" onClick={addRow}>
        เพิ่ม Timer
      </button>
    </div>
  );
};

export default TimerTable;
