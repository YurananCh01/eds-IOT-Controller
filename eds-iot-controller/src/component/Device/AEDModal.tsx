// AEDModal.tsx
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

type GroupNode = {
  id: string;
  name: string;
  children?: GroupNode[];
};

type FlatGroup = { id: string; label: string };

const API = import.meta.env.VITE_API_URL ?? "";

export default function AEDModal({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);

  const [groups, setGroups] = useState<GroupNode[] | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  const [devName, setDevName] = useState("");
  const [ip, setIp] = useState("");

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // โหลด groups (tree)
  useEffect(() => {
    (async () => {
      try {
        setLoadingGroups(true);
        const res = await axios.get<GroupNode[]>(`${API}/api/groups`, { timeout: 10000 });
        setGroups(res.data);
      } catch (e: any) {
        console.error("Error fetching groups:", e?.message || e);
        setError("โหลดรายชื่อกลุ่มไม่สำเร็จ");
      } finally {
        setLoadingGroups(false);
      }
    })();
  }, []);

  // flatten tree -> option list พร้อม path label เช่น "DefaultOrg / videowall"
  const flatGroups: FlatGroup[] = useMemo(() => {
    if (!groups) return [];
    const out: FlatGroup[] = [];
    const walk = (nodes: GroupNode[], prefix: string[] = []) => {
      nodes.forEach((n) => {
        const label = [...prefix, n.name].join(" / ");
        out.push({ id: n.id, label });
        if (n.children?.length) walk(n.children, [...prefix, n.name]);
      });
    };
    walk(groups);
    return out;
  }, [groups]);

  // validate IP (v4/v6 อย่างหยาบ ๆ)
  const isValidIp = (s: string) => {
    const ipv4 = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
    const ipv6 = /^(([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(::1)|([0-9a-f]{1,4}::[0-9a-f:]{0,}))$/i;
    return ipv4.test(s.trim()) || ipv6.test(s.trim());
  };

  const canSubmit = devName.trim() && selectedGroup && isValidIp(ip);

  const resetForm = () => {
    setDevName("");
    setIp("");
    setSelectedGroup("");
    setError(null);
  };

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await axios.post(
        `${API}/api/devices`,
        {
          name: devName.trim(),
          group_id: Number.isNaN(Number(selectedGroup)) ? selectedGroup : Number(selectedGroup),
          ipaddress: ip.trim(),
        },
        { timeout: 10000 }
      );
      if (onCreated) onCreated();
      setOpen(false);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "บันทึกอุปกรณ์ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginLeft: 25 }}>
      <Button variant="primary" onClick={() => setOpen(true)}>
        เพิ่มอุปกรณ์
      </Button>

      <Modal show={open} onHide={() => { setOpen(false); resetForm(); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มอุปกรณ์</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) handleSave();
            }}
          >
            <Form.Group className="mb-3" controlId="devName">
              <Form.Label>ชื่ออุปกรณ์</Form.Label>
              <Form.Control
                placeholder="เช่น Sensor-001"
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                autoFocus
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="group">
              <Form.Label>เลือกกลุ่ม</Form.Label>
              <Form.Select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
                disabled={loadingGroups || !groups}
              >
                <option value="">
                  {loadingGroups ? "กำลังโหลดกลุ่ม..." : "-- เลือกกลุ่ม --"}
                </option>
                {flatGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-1" controlId="IPaddress">
              <Form.Label>IP Address</Form.Label>
              <Form.Control
                placeholder="เช่น 192.168.1.100"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                isInvalid={!!ip && !isValidIp(ip)}
                required
              />
              <Form.Control.Feedback type="invalid">
                กรุณากรอก IP ที่ถูกต้อง (IPv4 หรือ IPv6)
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setOpen(false); resetForm(); }} disabled={saving}>
            ปิด
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!canSubmit || saving}>
            {saving ? (<><Spinner size="sm" className="me-2" /> บันทึก…</>) : "บันทึก"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
