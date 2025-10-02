const express = require("express");
const cors = require("cors");
const path = require('path');
const app = express();
const corsOptions = {
//   origin: 'https://cms.eds-center.com/', // หรือ IP เช่น http://192.168.1.10:3000
  origin: 'http://localhost:5173/', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // ถ้าใช้ cookie / auth token
};
app.use(cors());
app.use(express.json());
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const authRoute = require("./routes/auth");
// const GetDevice = require("./routes/mqtt");
const pool = require('./routes/db');
app.use("/api", authRoute); // route: /api/login
// app.use("/api", GetDevice);

app.get("/api/devices", (req, res) => {
    // const limit = parseInt(req.query.limit) || 10;
    // const offset = parseInt(req.query.offset) || 0;
    // const data = allDevices.slice(offset, offset + limit);
    const data = [
  { id: 1, name: 'Step room 1',location:'Siam Discovery', power: 1200, current: 5.4, voltage: 220, deviceStatus: 'Online', relayStatus: "1111" },
  { id: 2, name: 'Step room 2',location:'Siam Paragon', power: 500, current: 2.1, voltage: 220, deviceStatus: 'Offline', relayStatus: "1101" },
  { id: 3, name: 'Step room 3',location:'Siam Square', power: 60, current: 0.3, voltage: 220, deviceStatus: 'Online', relayStatus: "01" },
  
    ]
    res.json(data);
  });

  // Proxy to Shelly devices
const DEVICES_PATH = process.env.DEVICES_PATH || path.join(__dirname, './data/devices.json');
app.use('/shelly', express.raw({ type: '*/*', limit: '1mb' }));
const createProxyRouter = require('./routes/proxy');
app.use(createProxyRouter({ devicesPath: DEVICES_PATH }));

const PORT = process.env.PORT|| 4000;;
app.listen(PORT, () => console.log("✅ Server running on port", PORT));
