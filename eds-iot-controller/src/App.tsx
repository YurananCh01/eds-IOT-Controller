// App.tsx (หรือ App.jsx)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './page/Login/Login';
import DashboardAdmin from './page/DashboardAdmin';
import TemplateAdmin from './component/TemplateAdmin';
import Schedule from './page/Schedule/Schedule';
import Device from './page/Device/Device';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* layout */}
        <Route path="/templateAdmin" element={<TemplateAdmin />}>
          {/* ใช้แบบใดแบบหนึ่ง:
              1) ให้ /templateAdmin แสดง DashboardAdmin เลย */}
          <Route index element={<DashboardAdmin />} />
        </Route>
        
        <Route path="/device" element={<TemplateAdmin />} >
          <Route index element={<Device />} />
        </Route>
           <Route path="/schedule" element={<TemplateAdmin />} >
          <Route index element={<Schedule />} />
        </Route>
        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
