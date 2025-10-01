import { useState,useEffect,useMemo } from 'react';
import axios from 'axios';
import Card from '../component/Card';
import Table from '../component/Table';
import "./DashboardAdmin.css";

type Device = {
  id: number | string;
  name: string;
  location?: string;
  power?: number;
  current?: number;
  voltage?: number;
  deviceStatus?: "Online" | "Offline" | string;
  relayStatus?: string;
};

export default function DashboardAdmin() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
const API = import.meta?.env?.VITE_API_URL || "http://localhost:4000";
  // ถ้าอยากดึงซ้ำเป็นระยะ ให้ตั้งค่า POLL_MS > 0
  const POLL_MS = Number(import.meta?.env?.VITE_POLL_MS ?? 0); // 0 = ไม่ polling
useEffect(()=>{
    let mounted = true;
    const controller = new AbortController();

    const fetchDevices = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await axios.get<Device[]>(`${API}/api/devices`, {
          signal: controller.signal,
        });
        if (!mounted) return;
        setAllDevices(res.data ?? []);
      } catch (error: any) {
        if (!mounted) return;
        if (axios.isCancel(error)) return;
        console.error("Error fetching devices:", error);
        setErr(error?.message || "Fetch failed");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDevices();

    // ถ้ามี POLL_MS > 0 จะตั้ง interval อัปเดตอัตโนมัติ
    let timer: number | undefined;
    if (POLL_MS > 0) {
      timer = window.setInterval(fetchDevices, POLL_MS);
    }

    return () => {
      mounted = false;
      controller.abort();
      if (timer) window.clearInterval(timer);
    };
  }, [API, POLL_MS]);
  const countAll = allDevices.length;

  const { online, offline } = useMemo(() => {
    let on = 0, off = 0;
    for (const d of allDevices) {
      const s = (d.deviceStatus || "").toLowerCase();
      if (s === "online") on++;
      else if (s === "offline") off++;
    }
    return { online: on, offline: off };
  }, [allDevices]);
    return (
        <> 
            <div className="device_card">
                    <Card title="🔵 All Device" value={countAll} />
                    <Card title="🟢 Online" value={online} />
                    <Card title="🔴 Offline" value={offline} />
            </div>
         <Table alldevice={allDevices}/>
        </>
    );
}