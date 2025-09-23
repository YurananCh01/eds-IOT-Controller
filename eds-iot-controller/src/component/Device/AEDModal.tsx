import { Modal, Button } from "react-bootstrap";
import { useState } from "react";

export default function AEDModal() {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
    return (
    <div style={{marginLeft:"25px"}}>
      <Button variant="primary" onClick={() => setOpen(true)}>
          เพิ่ม
        </Button>
        <Button variant="warning" onClick={() => setEdit(true)}>
          แก้ไข
        </Button>
        <Button variant="danger" onClick={() => setDel(true)}>
          ลบ
        </Button>

        {/* Modal เพิ่ม */}
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
              <Button variant="primary" onClick={() => setOpen(false)}>
            บันทึก
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            ปิด
          </Button>
      
        </Modal.Footer>
      </Modal>

      {/* Modal ลบ */}
              <Modal show={del} onHide={() => setDel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ลบอุปกรณ์</Modal.Title>
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
              <Button variant="primary" onClick={() => setDel(false)}>
            บันทึก
          </Button>
          <Button variant="secondary" onClick={() => setDel(false)}>
            ปิด
          </Button>
      
        </Modal.Footer>
      </Modal>

            {/* Modal แก้ไข */}
              <Modal show={edit} onHide={() => setEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขอุปกรณ์</Modal.Title>
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
              <Button variant="primary" onClick={() => setEdit(false)}>
            บันทึก
          </Button>
          <Button variant="secondary" onClick={() => setEdit(false)}>
            ปิด
          </Button>
      
        </Modal.Footer>
      </Modal>
    </div>
    );
}
