import React from "react";
import Badge from "react-bootstrap/Badge"; // ✅ แนะนำ import แบบนี้เสถียรกว่า
// หรือจะใช้: import { Badge } from "react-bootstrap";

type DeviceData = {
  id: number | string;
  name: string;
  location: string;
  power: number;     // W
  current: number;   // A
  voltage: number;   // V
  deviceStatus: "Online" | "Offline" | string;
  relayStatus: string; // เช่น "1011"
};

type IotDataTableProps = {
  alldevice: DeviceData[];
  loading?: boolean;
  error?: string | null;
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

const thStyle: React.CSSProperties = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
  border: "1px solid #ccc",
  verticalAlign: "middle",
};

const IotDataTable: React.FC<IotDataTableProps> = ({ alldevice, loading, error }) => {
  if (loading) return <div style={{ padding: 20 }}>กำลังโหลดข้อมูล…</div>;
  if (error) return <div style={{ padding: 20, color: "#b00020" }}>เกิดข้อผิดพลาด: {error}</div>;
  if (!alldevice || alldevice.length === 0) return <div style={{ padding: 20 }}>ไม่มีข้อมูลอุปกรณ์</div>;

  return (
    <div style={{ padding: 20, overflowX: "auto" }}>
      <h2 style={{ marginBottom: 12 }}>ตารางแสดงผลข้อมูลอุปกรณ์ IoT</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr style={{ backgroundColor: "#f7f7f7" }}>
            <th style={thStyle}>ชื่ออุปกรณ์</th>
            <th style={thStyle}>ชื่อสถานที่</th>
            <th style={thStyle}>กำลังไฟฟ้า (W)</th>
            <th style={thStyle}>กระแสไฟฟ้า (A)</th>
            <th style={thStyle}>แรงดันไฟฟ้า (V)</th>
            <th style={thStyle}>สถานะอุปกรณ์</th>
            <th style={thStyle}>สถานะ Relay</th>
          </tr>
        </thead>

        <tbody>
          {alldevice.map((device) => (
            <tr key={device.id}>
              <td style={tdStyle}>{device.name}</td>
              <td style={tdStyle}>{device.location}</td>
              <td style={tdStyle}>{device.power}</td>
              {/* <td style={tdStyle}>{device.current.toFixed(2)}</td> */}
              <td style={tdStyle}>{device.voltage}</td>
              <td style={{ ...tdStyle, textAlign: "center", fontSize: "1.1rem" }}>
                {/* ใช้ bg ของ react-bootstrap ตรง ๆ ไม่ต้อง override สีเอง */}
                <Badge bg={getStatusVariant(device.deviceStatus)} pill>
                  {device.deviceStatus}
                </Badge>
              </td>
              <td style={tdStyle}>
                {device.relayStatus
                  ?.split("")
                  .map((char, i) => (
                    <span key={i} style={{ fontSize: "1.3rem", marginRight: 4 }}>
                      {char === "1" ? "🟩" : "🟥"}
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

export default IotDataTable;
