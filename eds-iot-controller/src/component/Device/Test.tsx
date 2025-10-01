import  { useEffect, useRef, useState } from "react";

// ===== Types =====
type Group = {
  id: string;
  name: string;
  children?: Group[];
};

// ===== Mock Data =====
const initialGroups: Group[] = [
  {
    id: "1",
    name: "DefaultOrg",
    children: [
      { id: "2", name: "default" },
      { id: "3", name: "videowall" },
    ],
  },
  { id: "4", name: "Unapproved" },
];

// ===== Utils =====
const uid = () => Math.random().toString(36).slice(2, 9);

// ===== Component =====
export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // close dropdown when clicking outside
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const addGroup = (parentId: string | null) => {
    const name = prompt("New group name:", "New Group");
    if (!name) return;
    const newGroup: Group = { id: uid(), name: name.trim() };

    if (!parentId) {
      setGroups(prev => [...prev, newGroup]);
      return;
    }

    const addChild = (items: Group[]): Group[] =>
      items.map(g =>
        g.id === parentId
          ? { ...g, children: [...(g.children || []), newGroup] }
          : { ...g, children: g.children ? addChild(g.children) : g.children }
      );
    setGroups(prev => addChild(prev));
  };

  const renameGroup = (id: string) => {
    const current = findGroup(groups, id);
    const name = prompt("Rename group:", current?.name ?? "");
    if (!name) return;
    const update = (items: Group[]): Group[] =>
      items.map(g =>
        g.id === id
          ? { ...g, name: name.trim() }
          : { ...g, children: g.children ? update(g.children) : g.children }
      );
    setGroups(prev => update(prev));
  };

  const deleteGroup = (id: string) => {
    // remove a node from any depth
    const remove = (items: Group[]): Group[] =>
      items
        .filter(g => g.id !== id)
        .map(g => ({ ...g, children: g.children ? remove(g.children) : g.children }));
    setGroups(prev => remove(prev));
  };

  const findGroup = (items: Group[], id: string): Group | undefined => {
    for (const g of items) {
      if (g.id === id) return g;
      if (g.children) {
        const r = findGroup(g.children, id);
        if (r) return r;
      }
    }
    return undefined;
  };

  const renderGroups = (items: Group[]) => (
    <ul className="space-y-1">
      {items.map(g => (
        <li key={g.id} className="select-none">
          {/* single-line row */}
          <div className="group flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 min-w-0">
            <span className="truncate">{g.name}</span>
            {/* three‑dots menu */}
            <div className="relative shrink-0">
              <button
                className="opacity-70 hover:opacity-100 px-2 py-1 rounded group-hover:bg-gray-200 dark:group-hover:bg-neutral-700"
                aria-label="More"
                onClick={e => {
                  e.stopPropagation();
                  setOpenMenuId(prev => (prev === g.id ? null : g.id));
                }}
              >
                ⋯
              </button>
              {openMenuId === g.id && (
                <div className="absolute right-0 mt-1 w-44 rounded-md border bg-white dark:bg-neutral-900 shadow-lg z-10">
                  <button
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    onClick={() => {
                      addGroup(g.id);
                      setOpenMenuId(null);
                    }}
                  >
                    New Subgroup
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    onClick={() => {
                      renameGroup(g.id);
                      setOpenMenuId(null);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => {
                      if (confirm(`Delete group "${g.name}" and its subgroups?`)) {
                        deleteGroup(g.id);
                        setOpenMenuId(null);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          {g.children && g.children.length > 0 && (
            <div className="ml-5 border-l border-dashed border-gray-300 dark:border-neutral-700 pl-3">
              {renderGroups(g.children)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={rootRef} className="p-4">
      <h1 className="text-lg font-bold mb-2">Device Groups</h1>
      {renderGroups(groups)}

      <button
        onClick={() => addGroup(null)}
        className="mt-3 px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-neutral-800"
      >
        + Root Group
      </button>
    </div>
  );
}
