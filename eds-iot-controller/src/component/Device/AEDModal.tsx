import { Modal, Button } from "react-bootstrap";
import { useState } from "react";

export default function AEDModal() {
  const [open, setOpen] = useState(false);
  const [Create,setCreate] = useState(false);
  const [del,setDel] = useState(false);
    return (
    <div style={{marginLeft:"25px"}}>
      <Button variant="primary" onClick={() => setOpen(true)}>
          เพิ่มอุปกรณ์
        </Button>
      <Button variant="success" onClick={() => setCreate(true)}>
          สร้างกลุ่ม
        </Button>
     <Button variant="danger" onClick={() => setDel(true)}>
          ลบกลุ่ม
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
            <label htmlFor="location" className="form-label">ชื่อกลุ่ม</label>
            <input id="location" className="form-control" placeholder="เช่น SIAM CENTER" />
          </div>
           <div className="mb-3">
            <label htmlFor="IPaddress" className="form-label">IP Address</label>
            <input id="IPaddress" className="form-control" placeholder="เช่น 192.168.1.100" />
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
        {/* Modal สร้างกลุ่ม */}
        <Modal show={Create} onHide={() => setCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>สร้างกลุ่ม</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">ชื่อกลุ่ม</label>
            <input id="location" className="form-control" placeholder="เช่น SIAM CENTER" />
          </div>
        </Modal.Body>

        <Modal.Footer>
              <Button variant="primary" onClick={() => setCreate(false)}>
            บันทึก
          </Button>
          <Button variant="secondary" onClick={() => setCreate(false)}>
            ปิด
          </Button>
      
        </Modal.Footer>
      </Modal>
       {/* Modal ลบกลุ่ม */}
        <Modal show={del} onHide={() => setDel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>สร้างกลุ่ม</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">ชื่อกลุ่ม</label>
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

    </div>
    );
}
