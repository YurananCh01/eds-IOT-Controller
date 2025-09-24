import React from 'react';
import {Badge} from 'react-bootstrap'
type DeviceData = {
  id: number;
  name: string;
  power: number;     // กำลังไฟฟ้า (Watt)
  current: number;   // กระแสไฟฟ้า (Ampere)
  voltage: number;   // แรงดันไฟฟ้า (Volt)
  deviceStatus: 'Online' | 'Offline' ;
  relayStatus: string;
};

const statusVariant: Record<string, string> = {
  online: "success",
  active: "success",
  running: "success",

  offline: "secondary",
  inactive: "secondary",

  warning: "warning",
  degraded: "warning",

  error: "danger",
  failed: "danger",
  fault: "danger",

  unknown: "dark",
};
const getStatusVariant = (s: string) => statusVariant[s?.toLowerCase()] ?? "dark";
const sampleData: DeviceData[] = [
  { id: 1, name: 'Step room 1', power: 1200, current: 5.4, voltage: 220, deviceStatus: 'Online', relayStatus: "1111" },
  { id: 2, name: 'Step room 2', power: 500, current: 2.1, voltage: 220, deviceStatus: 'Offline', relayStatus: "1101" },
  { id: 3, name: 'Step room 3', power: 60, current: 0.3, voltage: 220, deviceStatus: 'Online', relayStatus: "01" },
  
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Online':
      return 'green';
    case 'Offline':
      return 'red';
    default:
      return 'black';
  }
};

const IotDataTable: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>ตารางแสดงผลข้อมูลอุปกรณ์ IoT</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={thStyle}>ชื่ออุปกรณ์</th>
            <th style={thStyle}>กำลังไฟฟ้า (W)</th>
            <th style={thStyle}>กระแสไฟฟ้า (A)</th>
            <th style={thStyle}>แรงดันไฟฟ้า (V)</th>
            <th style={thStyle}>สถานะอุปกรณ์</th>
            <th style={thStyle}>สถานะ Relay</th>
          </tr>
        </thead>
        <tbody>
          {sampleData.map((device) => (
            <tr key={device.id}>
              <td style={tdStyle}>{device.name}</td>
              <td style={tdStyle}>{device.power}</td>
              <td style={tdStyle}>{device.current.toFixed(2)}</td>
              <td style={tdStyle}>{device.voltage}</td>
              <td style={{ textAlign: 'center', fontSize: '1.4rem', ...tdStyle }}>
                <Badge bg={getStatusVariant(device.deviceStatus)} pill style={{ backgroundColor: getStatusColor(device.deviceStatus) }}>
                  {device.deviceStatus}
                </Badge>
              </td>
              <td style={tdStyle}>
              {device.relayStatus
                .split('')
                .map((char, index) => (
                  <span key={index} style={{ fontSize: '1.5rem' }}>
                    {char === '1' ? '🟩' : '🟥'}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #ccc',
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #ccc',
};

export default IotDataTable;
