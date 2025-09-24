import React, { useState } from 'react';
import './TimerTable.css';

type TimerRow = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
};

const TimerTable: React.FC = () => {
  const [timers, setTimers] = useState<TimerRow[]>([
    { id: 1, name: 'Siam Discovery', startTime: '', endTime: '' },
  ]);

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
      { id: newId, name: '', startTime: '', endTime: '' },
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
        เพิ่มกลุ่ม
      </button>
    </div>
  );
};

export default TimerTable;
