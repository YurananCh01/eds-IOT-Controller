import { useState } from "react";
import {Badge,Form,Dropdown,DropdownButton} from 'react-bootstrap'
import AEDModal from './AEDModal';

type Option = {
  label: string;
  value: string;
};
type DeviceData = {
  id: number;
  name: string;
  location: string;
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
  { id: 1, name: 'Step room 1',location:'Siam Discovery', power: 1200, current: 5.4, voltage: 220, deviceStatus: 'Online', relayStatus: "1111" },
  { id: 2, name: 'Step room 2',location:'Siam Paragon', power: 500, current: 2.1, voltage: 220, deviceStatus: 'Offline', relayStatus: "1101" },
  { id: 3, name: 'Step room 3',location:'Siam Square', power: 60, current: 0.3, voltage: 220, deviceStatus: 'Online', relayStatus: "01" },
  
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
  const [searchTerm, setSearchTerm] = useState('');
      const options: Option[] = [
       { label: 'All', value: 'All' },
    { label: 'Siam Discovery', value: 'Siam Discovery' },
    { label: 'Siam Paragon', value: 'Siam Paragon' },
    { label: 'Siam Square', value: 'Siam Square' },
    ];
  
  
    const [selectedOption, setSelectedOption] = useState<string>('All');
  const filteredData = sampleData.filter((device) =>{
     const matchesName = device.name.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesLocation = selectedOption === 'All' || device.location === selectedOption;
     return matchesName && matchesLocation
  }
    // device.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



  
      const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedOption(event.target.value);
    };
  
  return (
    <div style={{ padding: '20px' }}>
  
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2>ตารางแสดงผลข้อมูลอุปกรณ์ IoT</h2>
     
          <AEDModal />
        </div>
      
             {/* 🔍 Search Bar */}
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่ออุปกรณ์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '1rem', padding: '0.5rem', width: '300px' }}
              />
            <select id="dropdown" value={selectedOption} onChange={handleChange} style={{ marginLeft:"1rem",marginBottom: '1rem', padding: '0.5rem', width: '200px' }}>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={thStyle}>ชื่ออุปกรณ์</th>
            <th style={thStyle}>ชื่อกลุ่ม</th>
            <th style={thStyle}>กำลังไฟฟ้า (W)</th>
            <th style={thStyle}>กระแสไฟฟ้า (A)</th>
            <th style={thStyle}>แรงดันไฟฟ้า (V)</th>
            <th style={thStyle}>สถานะอุปกรณ์</th>
            <th style={thStyle}>สถานะ Relay</th>
            <th style={thStyle}>ควบคุม Relay</th>
            <th style={thStyle}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((device) => (
            <tr key={device.id}>
              <td style={tdStyle}>{device.name}</td>
              <td style={tdStyle}>{device.location}</td>
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
           <td style={tdStyle}>
              {[0, 1, 2, 3].map((i) => {
                const isEnabled = i < device.relayStatus.length;
                const isChecked = device.relayStatus[i] === '1';

                return (
                  <Form.Check
                    key={i}
                    type="switch"
                    id={`relay-${device.id}-${i}`}
                    label={`Relay ${i + 1}`}
                    disabled={!isEnabled}
                    checked={isChecked}
                    readOnly
                    style={{ marginBottom: '5px' }}
                  />
                );
              })}
            </td>
              <td style={tdStyle}> 
                   <DropdownButton id="dropdown-secondary-button"  variant="secondary"  title="">
                    <Dropdown.Item href="#/action-1">แก้ไข</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">ลบ</Dropdown.Item>
                  </DropdownButton>  
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
  textAlign:'center'
};

export default IotDataTable;
