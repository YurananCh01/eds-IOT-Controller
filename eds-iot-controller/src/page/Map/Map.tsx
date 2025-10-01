
// ------------------------------ src/main.tsx ------------------------------
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";
// import "leaflet/dist/leaflet.css"; // IMPORTANT: Leaflet base CSS

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // ------------------------------ src/index.css ------------------------------
// /* Make sure the app uses full height so the map has space */
// html, body, #root { height: 100%; margin: 0; }
// * { box-sizing: border-box; }

// /* Optional: nicer font */
// body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; }

// // ------------------------------ src/App.tsx ------------------------------
// import FloorplanMap from "./components/FloorplanMap";

// export default function App() {
//   return (
//     <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//       <header style={{ padding: 12, borderBottom: "1px solid #eee" }}>
//         <strong>Floorplan Uploader • Leaflet (CRS.Simple) • React + Vite</strong>
//       </header>
//       <main style={{ flex: 1, padding: 12 }}>
//         <FloorplanMap />
//       </main>
//     </div>
//   );
// }

// ---------------------- src/components/FloorplanMap.tsx ----------------------
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents, ZoomControl, ScaleControl } from "react-leaflet";
import L from "leaflet";

/**
 * Floorplan map using Leaflet with CRS.Simple (pixel coordinates)
 * - Upload any floorplan image (PNG/JPG/SVG*)
 * - Auto-fits image bounds
 * - Click to add markers, drag to reposition, delete from list
 * - Import/Export markers JSON
 * - Optional grid & snap-to-grid
 *
 * For very large SVG, consider PNG for better perf.
 */

export type FPMarker = {
  id: string;
  x: number; // pixel X (from left)
  y: number; // pixel Y (from top)
  label?: string;
};

// Default Leaflet icon
const DefaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

async function readImageFile(file: File): Promise<{ url: string; width: number; height: number }>{
  const url = URL.createObjectURL(file);
  const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
  return { url, ...dims };
}

export default function FloorplanMap() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgW, setImgW] = useState<number>(1000);
  const [imgH, setImgH] = useState<number>(700);
  const [markers, setMarkers] = useState<FPMarker[]>([]);
  const [grid, setGrid] = useState<boolean>(false);
  const [snap, setSnap] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(50);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Bounds for CRS.Simple: [[yTop,xLeft],[yBottom,xRight]] with pixels as units
  const bounds = useMemo(() => new L.LatLngBounds([0, 0], [imgH, imgW]), [imgW, imgH]);

  // Convert between image pixel coords <-> LatLng (CRS.Simple): LatLng = (y, x)
  const toLatLng = useCallback((x: number, y: number) => L.latLng(y, x), []);
  const fromLatLng = useCallback((ll: L.LatLng) => ({ x: ll.lng, y: ll.lat }), []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { url, width, height } = await readImageFile(file);
    setImgW(width);
    setImgH(height);
    setMarkers([]);
    setImageUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
  };

  const addAtLatLng = (ll: L.LatLng) => {
    let { x, y } = fromLatLng(ll);
    if (snap) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    const id = crypto.randomUUID();
    setMarkers((m) => [...m, { id, x, y, label: `P${m.length + 1}` }]);
    setSelectedId(id);
  };

  const updateMarker = (id: string, data: Partial<FPMarker>) => {
    setMarkers((m) => m.map((it) => (it.id === id ? { ...it, ...data } : it)));
  };

  const removeMarker = (id: string) => {
    setMarkers((m) => m.filter((it) => it.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const exportJSON = () => {
    const payload = { image: { width: imgW, height: imgH }, markers };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "floorplan-markers.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    try {
      const payload = JSON.parse(text);
      if (payload?.image?.width && payload?.image?.height && Array.isArray(payload?.markers)) {
        setImgW(payload.image.width); setImgH(payload.image.height); setMarkers(payload.markers);
      } else { alert("Invalid JSON format"); }
    } catch { alert("Failed to parse JSON"); }
  };

  return (
    <div style={{ display: "flex", height: "70vh", gap: 12 }}>
      {/* Left controls */}
      <div style={{ width: 290, flexShrink: 0, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>เพิ่มแผนที่</div>
        <input type="file" accept="image/*,.svg" onChange={onFileChange} />
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Size: {imgW} × {imgH} px</div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={grid} onChange={(e) => setGrid(e.target.checked)} /> Show grid
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} /> Snap to grid
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Grid <input type="number" min={5} step={5} value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} style={{ width: 72 }} /> px
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={exportJSON}>Export JSON</button>
          <label style={{ background: "#f3f4f6", padding: "4px 8px", borderRadius: 6, cursor: "pointer" }}>
            Import
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={importJSON} />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Markers ({markers.length})</div>
          <div style={{ maxHeight: "36vh", overflow: "auto", paddingRight: 6 }}>
            {markers.map((m) => (
              <div key={m.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <input
                    value={m.label ?? ""}
                    onChange={(e) => updateMarker(m.id, { label: e.target.value })}
                    style={{ width: 140 }}
                  />
                  <div style={{ fontSize: 12, opacity: 0.7 }}>({Math.round(m.x)}, {Math.round(m.y)})</div>
                </div>
                <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                  <button onClick={() => setSelectedId(m.id)}>Select</button>
                  <button onClick={() => removeMarker(m.id)} style={{ color: "#b91c1c" }}>Delete</button>
                </div>
              </div>
            ))}
            {markers.length === 0 && <div style={{ fontSize: 12, opacity: 0.6 }}>Click on the map to add markers.</div>}
          </div>
        </div>
      </div>

      {/* Right map */}
      <div style={{ flex: 1, border: "1px solid #eee", borderRadius: 12, overflow: "hidden", position: "relative" }}>
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          style={{ height: "100%", width: "1080px" }}
          zoomSnap={0.1}
          zoomDelta={0.5}
          minZoom={-4}
          maxZoom={4}
          zoomControl={false}
        >
          <FitToImage imageUrl={imageUrl} bounds={bounds} />
          {imageUrl && (
            <ImageOverlay key={imageUrl} url={imageUrl} bounds={bounds} opacity={1} />
          )}
          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" />
          <ClickToAdd addAtLatLng={addAtLatLng} />

          {markers.map((m) => (
            <Marker
              key={m.id}
              position={toLatLng(m.x, m.y)}
              icon={DefaultIcon}
              draggable
              eventHandlers={{
                click: () => setSelectedId(m.id),
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng();
                  let { x, y } = fromLatLng(ll);
                  if (snap) {
                    x = Math.round(x / gridSize) * gridSize;
                    y = Math.round(y / gridSize) * gridSize;
                  }
                  updateMarker(m.id, { x, y });
                },
              }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{m.label ?? "(no label)"}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>X: {Math.round(m.x)} px<br/>Y: {Math.round(m.y)} px</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {grid && <GridOverlay width={imgW} height={imgH} gridSize={gridSize} />}
        </MapContainer>

        <div style={{ position: "absolute", left: 12, top: 12, background: "rgba(255,255,255,.8)", padding: "2px 8px", borderRadius: 10, fontSize: 12 }}>
          Floorplan • CRS.Simple • Click to add markers
        </div>
      </div>
    </div>
  );
}

function ClickToAdd({ addAtLatLng }: { addAtLatLng: (ll: L.LatLng) => void }) {
  useMapEvents({ click: (e) => addAtLatLng(e.latlng) });
  return null;
}

function FitToImage({ imageUrl, bounds }: { imageUrl: string | null; bounds: L.LatLngBounds }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (!imageUrl) return;
    // Wait next tick to ensure ImageOverlay is mounted
    setTimeout(() => {
      map.fitBounds(bounds, { padding: [20, 20] });
      map.invalidateSize();
    }, 0);
  }, [imageUrl, bounds, map]);
  return null;
}

function GridOverlay({ width, height, gridSize }: { width: number; height: number; gridSize: number }) {
  // Use an SVG overlay aligned to CRS.Simple coords by mirroring the image bounds box
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="leaflet-overlay-pane"
      style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}
    >
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={"v" + i} x1={i * gridSize} y1={0} x2={i * gridSize} y2={height} stroke="#000" strokeOpacity={0.12} strokeWidth={1} />
      ))}
      {Array.from({ length: rows + 1 }).map((_, j) => (
        <line key={"h" + j} x1={0} y1={j * gridSize} x2={width} y2={j * gridSize} stroke="#000" strokeOpacity={0.12} strokeWidth={1} />
      ))}
    </svg>
  );
}
