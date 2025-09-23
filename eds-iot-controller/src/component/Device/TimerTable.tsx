import React, { useState } from 'react';
import './TimerTable.css';

type TimerRow = {
  id: number;
  startTime: string;
  endTime: string;
};

const TimerTable: React.FC = () => {
  const [timers, setTimers] = useState<TimerRow[]>([
    { id: 1, startTime: '', endTime: '' },
  ]);

  const handleTimeChange = (id: number, field: 'startTime' | 'endTime', value: string) => {
    setTimers(prev =>
      prev.map(timer =>
        timer.id === id ? { ...timer, [field]: value } : timer
      )
    );
  };

  const addRow = () => {
    const newId = timers.length > 0 ? timers[timers.length - 1].id + 1 : 1;
    setTimers([...timers, { id: newId, startTime: '', endTime: '' }]);
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
                  type="time"
                  value={timer.startTime}
                  onChange={e => handleTimeChange(timer.id, 'startTime', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={timer.endTime}
                  onChange={e => handleTimeChange(timer.id, 'endTime', e.target.value)}
                />
              </td>
              <td>
                <button className="delete-btn" onClick={() => removeRow(timer.id)}>
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-btn" onClick={addRow}>เพิ่มแถว</button>
    </div>
  );
};

export default TimerTable;
