// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './page/Login/Login';
import DashboardAdmin from './page/DashboardAdmin';
import TemplateAdmin from './component/TemplateAdmin';
import Schedule from './page/Schedule/Schedule';
import Device from './page/Device/Device';
import Map from './page/Map/Map';
import React from 'react';

// ===== Guard =====
function isJwtExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);
    return typeof decoded.exp === 'number' ? decoded.exp <= now : true;
  } catch {
    return true; // อ่านไม่ได้ = ใช้ไม่ได้
  }
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token') || '';
  const authed = !!token && !isJwtExpired(token);
  if (!authed) {
    // กันหลุดรอด
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  return children;
}
// =================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* protected layouts */}
        <Route
          path="/templateAdmin"
          element={
            <RequireAuth>
              <TemplateAdmin />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardAdmin />} />
        </Route>

        <Route
          path="/device"
          element={
            <RequireAuth>
              <TemplateAdmin />
            </RequireAuth>
          }
        >
          <Route index element={<Device />} />
        </Route>

        <Route
          path="/schedule"
          element={
            <RequireAuth>
              <TemplateAdmin />
            </RequireAuth>
          }
        >
          <Route index element={<Schedule />} />
        </Route>

        <Route
          path="/map"
          element={
            <RequireAuth>
              <TemplateAdmin />
            </RequireAuth>
          }
        >
          <Route index element={<Map />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
