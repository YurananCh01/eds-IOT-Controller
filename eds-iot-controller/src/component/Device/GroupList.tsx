// GroupList.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./GroupList.css";
import { Modal, Button, Form } from "react-bootstrap";

const API = import.meta.env.VITE_API_URL ?? "";

export type GroupNode = {
  id: string;
  name: string;
  children?: GroupNode[];
  // ↓ เพิ่ม: จะถูกเติมโดยฝั่ง frontend
  devices?: Device[];
};

type Device = {
  id: string | number;
  name: string;
  group_id: string | number;
  ipaddress: string;
};

type CreateGroupBody = { name: string; parent_id: string | null };
type UpdateGroupBody = { name?: string; parent_id?: string | null };

const cls = (...tokens: (string | false | undefined)[]) => tokens.filter(Boolean).join(" ");

export default function GroupList() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [groups, setGroups] = useState<GroupNode[] | null>(null);
  const [devices, setDevices] = useState<Device[] | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // ===== Create modal =====
  const [createOpen, setCreateOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");

  // ===== Rename modal =====
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  // ===== Delete modal =====
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  // ปิดเมนู 3 จุดเมื่อคลิกนอก
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // โหลด groups + devices พร้อมกัน
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [gRes, dRes] = await Promise.all([
          axios.get<GroupNode[]>(`${API}/api/groups`, { timeout: 10000 }),
          axios.get<Device[]>(`${API}/api/devices`, { timeout: 10000 }),
        ]);
        setGroups(gRes.data);
        setDevices(dRes.data);

        // เปิด root ทั้งหมด
        const exp: Record<string, boolean> = {};
        gRes.data.forEach((g) => (exp[g.id] = true));
        setExpanded(exp);
      } catch (e: any) {
        setError(e?.response?.data?.message || "โหลดข้อมูลกลุ่ม/อุปกรณ์ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ===== รวม devices เข้าไปใน tree ตาม group_id =====
  const treeWithDevices = useMemo(() => {
    if (!groups) return null;
    const index = new Map<string, Device[]>();
    (devices ?? []).forEach((d) => {
      const gid = String(d.group_id);
      if (!index.has(gid)) index.set(gid, []);
      index.get(gid)!.push(d);
    });

    const attach = (items: GroupNode[]): GroupNode[] =>
      items.map((g) => ({
        ...g,
        devices: index.get(String(g.id)) ?? [],
        children: g.children ? attach(g.children) : g.children,
      }));

    return attach(groups);
  }, [groups, devices]);

  // ===== Helpers (tree ops) =====
  function updateTree(items: GroupNode[], id: string, upd: (g: GroupNode) => GroupNode): GroupNode[] {
    return items.map((g) =>
      g.id === id ? upd(g) : { ...g, children: g.children ? updateTree(g.children, id, upd) : g.children }
    );
  }
  function removeNode(items: GroupNode[], id: string): GroupNode[] {
    return items
      .filter((g) => g.id !== id)
      .map((g) => ({ ...g, children: g.children ? removeNode(g.children, id) : g.children }));
  }
  function findGroup(items: GroupNode[], id: string): GroupNode | undefined {
    for (const g of items) {
      if (g.id === id) return g;
      if (g.children) {
        const r = findGroup(g.children, id);
        if (r) return r;
      }
    }
    return undefined;
  }

  // ===== Open modals =====
  const openCreateModal = (parentId: string | null) => {
    setCreateParentId(parentId);
    setCreateName("");
    setCreateOpen(true);
    setOpenMenuId(null);
  };
  const openRenameModal = (id: string) => {
    if (!groups) return;
    const current = findGroup(groups, id);
    setRenameId(id);
    setRenameName(current?.name ?? "");
    setRenameOpen(true);
    setOpenMenuId(null);
  };
  const openDeleteModal = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteOpen(true);
    setOpenMenuId(null);
  };

  // ===== Create submit =====
  const handleCreateSubmit = async () => {
    if (!groups) return;
    const name = createName.trim();
    if (!name) return;

    setSaving(true);
    setError(null);

    // optimistic
    const tempId = `tmp_${Date.now()}`;
    const optimistic = structuredClone(groups) as GroupNode[];
    const newNode: GroupNode = { id: tempId, name };

    const addChild = (items: GroupNode[]): GroupNode[] =>
      items.map((g) =>
        g.id === createParentId
          ? { ...g, children: [...(g.children || []), newNode] }
          : { ...g, children: g.children ? addChild(g.children) : g.children }
      );

    const optimisticNext = createParentId === null ? [...optimistic, newNode] : addChild(optimistic);
    setGroups(optimisticNext);
    if (createParentId) setExpanded((p) => ({ ...p, [createParentId!]: true }));

    try {
      const res = await axios.post<GroupNode>(
        `${API}/api/groups`,
        { name, parent_id: createParentId } as CreateGroupBody,
        { timeout: 10000 }
      );
      const real = res.data;
      const replaceId = (items: GroupNode[]): GroupNode[] =>
        items.map((g) =>
          g.id === tempId
            ? { ...real }
            : { ...g, children: g.children ? replaceId(g.children) : g.children }
        );
      setGroups((prev) => (prev ? replaceId(prev) : prev));
      setCreateOpen(false);
    } catch (e: any) {
      setGroups(groups); // rollback
      setError(e?.response?.data?.message || "สร้างกลุ่มไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // ===== Rename submit =====
  const handleRenameSubmit = async () => {
    if (!groups || !renameId) return;
    const newName = renameName.trim();
    if (!newName) return;

    setSaving(true);
    setError(null);

    const prev = groups;
    setGroups(updateTree(groups, renameId, (g) => ({ ...g, name: newName })));

    try {
      await axios.patch(`${API}/api/groups/${renameId}`, { name: newName } as UpdateGroupBody, {
        timeout: 10000,
      });
      setRenameOpen(false);
    } catch (e: any) {
      setGroups(prev); // rollback
      setError(e?.response?.data?.message || "เปลี่ยนชื่อกลุ่มไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete confirm =====
  const handleDeleteConfirm = async () => {
    if (!groups || !deleteId) return;

    setSaving(true);
    setError(null);

    const prev = groups;
    setGroups(removeNode(groups, deleteId));

    try {
      await axios.delete(`${API}/api/groups/${deleteId}`, { timeout: 10000 });
      setDeleteOpen(false);
    } catch (e: any) {
      setGroups(prev); // rollback
      setError(e?.response?.data?.message || "ลบกลุ่มไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // ===== filter (กับ tree ที่มี devices แล้ว) =====
  const filtered = useMemo(() => {
    if (!treeWithDevices) return null;
    if (!filter.trim()) return treeWithDevices;
    const q = filter.trim().toLowerCase();

    const matchTree = (items: GroupNode[]): GroupNode[] => {
      const out: GroupNode[] = [];
      for (const g of items) {
        const kids = g.children ? matchTree(g.children) : undefined;
        const selfHit =
          g.name.toLowerCase().includes(q) ||
          (g.devices ?? []).some(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              String(d.ipaddress).toLowerCase().includes(q)
          );
        if (selfHit || (kids && kids.length > 0)) {
          out.push({ ...g, children: kids, devices: g.devices });
        }
      }
      return out;
    };
    return matchTree(treeWithDevices);
  }, [treeWithDevices, filter]);

  return (
    <div ref={rootRef} className="gl-root">
      <header className="gl-header">
        <h1 className="gl-title">Device Groups</h1>
        {saving && (
          <span className="gl-saving">
            <span className="gl-spin" /> Saving…
          </span>
        )}
        <div className="gl-actions">
          <input
            className="gl-search"
            placeholder="ค้นหากลุ่มหรืออุปกรณ์…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button onClick={() => openCreateModal(null)} className="gl-btn gl-btn-primary">
            + สร้างกลุ่มหลัก
          </button>
        </div>
      </header>

      {error && <div className="gl-alert gl-alert-error">{error}</div>}

      <div className="gl-scroll">
        {loading ? (
          <SkeletonTree />
        ) : filtered && filtered.length > 0 ? (
          <TreeView
            items={filtered}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            expanded={expanded}
            setExpanded={setExpanded}
            onCreate={(parentId) => openCreateModal(parentId)}
            onRename={(id) => openRenameModal(id)}
            onDelete={(id, name) => openDeleteModal(id, name)}
          />
        ) : (
          <EmptyState onCreate={() => openCreateModal(null)} />
        )}
      </div>

      {/* ===== Create Modal ===== */}
      <Modal show={createOpen} onHide={() => setCreateOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{createParentId ? "สร้างกลุ่มย่อย" : "สร้างกลุ่มหลัก"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubmit();
            }}
          >
            <Form.Group className="mb-3" controlId="groupName">
              <Form.Label>ชื่อกลุ่ม</Form.Label>
              <Form.Control
                placeholder={createParentId ? "เช่น Floor-2 / Camera / ..." : "เช่น Organization / Default / ..."}
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreateSubmit} disabled={!createName.trim() || saving}>
            บันทึก
          </Button>
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Rename Modal ===== */}
      <Modal show={renameOpen} onHide={() => setRenameOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>เปลี่ยนชื่อกลุ่ม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleRenameSubmit();
            }}
          >
            <Form.Group className="mb-3" controlId="renameGroup">
              <Form.Label>ชื่อใหม่</Form.Label>
              <Form.Control
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="พิมพ์ชื่อใหม่"
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleRenameSubmit} disabled={!renameName.trim() || saving}>
            บันทึก
          </Button>
          <Button variant="secondary" onClick={() => setRenameOpen(false)}>
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Delete Modal ===== */}
      <Modal show={deleteOpen} onHide={() => setDeleteOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ลบกลุ่ม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          คุณต้องการลบกลุ่ม <strong>{deleteName}</strong> และกลุ่มย่อยทั้งหมดหรือไม่?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={saving}>
            ลบ
          </Button>
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function TreeView(props: {
  items: GroupNode[];
  openMenuId: string | null;
  setOpenMenuId: (v: string | null) => void;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onCreate: (parentId: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const { items, openMenuId, setOpenMenuId, expanded, setExpanded, onCreate, onRename, onDelete } = props;
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <ul className="gl-tree">
      {items.map((g) => (
        <li key={g.id}>
          <div className="gl-row">
            <div className="gl-row-left">
              <button
                aria-label={expanded[g.id] ? "Collapse" : "Expand"}
                onClick={() => toggle(g.id)}
                className={cls("gl-caret", !g.children?.length && !g.devices?.length && "gl-caret--disabled")}
              >
                {expanded[g.id] ? "▾" : "▸"}
              </button>
              <span className="gl-name">
                <span className="gl-dot" />
                <span className="gl-name-text">{g.name}</span>
                {/* แสดงจำนวนอุปกรณ์ในกลุ่มนี้ */}
                {(g.devices?.length ?? 0) > 0 && <span className="gl-badge">{g.devices!.length}</span>}
              </span>
            </div>

            <div className="gl-menu-wrap">
              <button
                className="gl-menu-btn"
                aria-label="More"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === g.id ? null : g.id);
                }}
              >
                ⋯
              </button>
              {openMenuId === g.id && (
                <div className="gl-menu">
                  <button className="gl-menu-item" onClick={() => onCreate(g.id)}>
                    สร้างกลุ่มย่อย
                  </button>
                  <button className="gl-menu-item" onClick={() => onRename(g.id)}>
                    เปลี่ยนชื่อ
                  </button>
                  <button className="gl-menu-item gl-danger" onClick={() => onDelete(g.id, g.name)}>
                    ลบ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* แสดงอุปกรณ์ของกลุ่มนี้ */}
          {expanded[g.id] && (g.devices?.length ?? 0) > 0 && (
            <ul className="gl-devs">
              {g.devices!.map((d) => (
                <li key={String(d.id)} className="gl-dev-row">
                  <div className="gl-dev-left">
                    <span className="gl-dev-icon">📟</span>
                    <span className="gl-dev-name">{d.name}</span>
                  </div>
                  <span className="gl-dev-ip">{d.ipaddress}</span>
                </li>
              ))}
            </ul>
          )}

          {/* แสดงกลุ่มย่อย */}
          {g.children && g.children.length > 0 && expanded[g.id] && (
            <div className="gl-children">
              <TreeView
                items={g.children}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                expanded={expanded}
                setExpanded={setExpanded}
                onCreate={onCreate}
                onRename={onRename}
                onDelete={onDelete}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function SkeletonTree() {
  return (
    <ul className="gl-skeleton-list">
      {[...Array(4)].map((_, i) => (
        <li key={i} className="gl-skeleton-line" />
      ))}
    </ul>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="gl-empty">
      <p className="gl-empty-text">ยังไม่มีกลุ่ม</p>
      <button onClick={onCreate} className="gl-btn gl-btn-primary">
        + สร้างกลุ่มหลัก
      </button>
    </div>
  );
}
