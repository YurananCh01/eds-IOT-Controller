import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Login from './page/Login/Login';
import DashboardAdmin from './page/DashboardAdmin';
import TemplateAdmin from './component/TemplateAdmin';
import Schedule from './page/Schedule/Schedule';
import Device from './page/Device/Device';
import Map from './page/Map/Map';

function isJwtExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const { exp } = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);
    return typeof exp === 'number' ? exp <= now : true;
  } catch {
    return true;
  }
}

function RequireAuth() {
  const location = useLocation();
  const token = localStorage.getItem('token') || '';
  const authed = !!token && !isJwtExpired(token);
  if (!authed) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

// ถ้าล็อกอินแล้ว ห้ามเข้า /login อีก: รีไดเรกต์ไป /templateAdmin
function RedirectIfAuthed() {
  const token = localStorage.getItem('token') || '';
  const authed = !!token && !isJwtExpired(token);
  return authed ? <Navigate to="/templateAdmin" replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public แต่กันผู้ใช้ที่ล็อกอินแล้วไม่ให้เข้าซ้ำ */}
        <Route element={<RedirectIfAuthed />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* protected */}
        <Route element={<RequireAuth />}>
          <Route path="/templateAdmin" element={<TemplateAdmin />}>
            <Route index element={<DashboardAdmin />} />
          </Route>

          <Route path="/device" element={<TemplateAdmin />}>
            <Route index element={<Device />} />
          </Route>

          <Route path="/schedule" element={<TemplateAdmin />}>
            <Route index element={<Schedule />} />
          </Route>

          <Route path="/map" element={<TemplateAdmin />}>
            <Route index element={<Map />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
