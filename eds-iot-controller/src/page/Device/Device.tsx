// DashboardAdmin.tsx
import { useState } from "react";
import { Modal, Button,Table, Badge } from "react-bootstrap";
import "./Device.css";

type Device = {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
};


export default function DashboardAdmin() {
  const [devices, setDevices] = useState<Device[]>([
    { id: "D-001", name: "Step room 1", location: "SIAM CENTER", status: "online" },
    { id: "D-002", name: "Step room 2", location: "SIAM PARAGON", status: "offline" },
    { id: "D-003", name: "Step room 3", location: "SIAM CENTER", status: "online" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "" });

  const addDevice = () => {
    if (!form.name.trim() || !form.location.trim()) return;
    const newDev: Device = {
      id: `D-${(devices.length + 1).toString().padStart(3, "0")}`,
      name: form.name.trim(),
      location: form.location.trim(),
      status: "online",
    };
    setDevices((prev) => [newDev, ...prev]);
    setForm({ name: "", location: "" });
    setOpen(false);
  };

  return (
    <>
      <div className="top-section">
        <Button variant="primary" onClick={() => setOpen(true)}>
          เพิ่มอุปกรณ์
        </Button>
      </div>

      <div className="content-section">
        <h2 className="mb-3">อุปกรณ์ทั้งหมด</h2>

        <Table striped bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th style={{ width: 80 }}>ลำดับ</th>
              <th>ชื่ออุปกรณ์</th>
              <th>สถานที่</th>
              <th style={{ width: 120 }}>สถานะ</th>
              <th style={{ width: 140 }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  ยังไม่มีอุปกรณ์
                </td>
              </tr>
            ) : (
              devices.map((d, idx) => (
                <tr key={d.id}>
                  <td>{idx + 1}</td>
                  <td className="text-start">{d.name}</td>
                  <td className="text-start">{d.location}</td>
                  <td>
                    {d.status === "online" ? (
                      <Badge bg="success">Online</Badge>
                    ) : (
                      <Badge bg="secondary">Offline</Badge>
                    )}
                  </td>
                  <td className="d-flex gap-2 justify-content-center">
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => alert(`แก้ไข ${d.id}`)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDevices((prev) => prev.filter((x) => x.id !== d.id))}
                    >
                      ลบ
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal เพิ่มอุปกรณ์ */}
      <Modal show={open} onHide={() => setOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มอุปกรณ์</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="devName" className="form-label">ชื่ออุปกรณ์</label>
            <input
              id="devName"
              className="form-control"
              placeholder="เช่น Sensor-001"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">สถานที่</label>
            <input
              id="location"
              className="form-control"
              placeholder="เช่น SIAM CENTER"
              value={form.location}
              onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            ปิด
          </Button>
          <Button variant="primary" onClick={addDevice}>
            บันทึก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
