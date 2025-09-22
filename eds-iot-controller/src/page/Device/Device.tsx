// DashboardAdmin.tsx
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./Device.css";

export default function DashboardAdmin() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1>Device page</h1>
        <Button variant="primary" onClick={() => setOpen(true)}>
          เปิด Modal
        </Button>
      </div>

      <Modal show={open} onHide={() => setOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มอุปกรณ์</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="devName" className="form-label">ชื่ออุปกรณ์</label>
            <input id="devName" className="form-control" placeholder="เช่น Sensor-001" />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">สถานที่</label>
            <input id="location" className="form-control" placeholder="เช่น SIAM CENTER" />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            ปิด
          </Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            บันทึก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
