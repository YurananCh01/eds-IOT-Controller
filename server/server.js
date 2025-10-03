import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
// 👉 คำนวณ __dirname แบบ ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//import route
import groupsRouter from "./routes/group.js";   
import authRoute from "./routes/auth.js";       
import createProxyRouter from "./routes/proxy.js";
import devicesRouter from "./routes/devices.js";
const app = express();
const corsOptions = {
//   origin: 'https://cms.eds-center.com/', // หรือ IP เช่น http://192.168.1.10:3000
  origin: 'http://localhost:5173/', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // ถ้าใช้ cookie / auth token
};

// Middlewares
app.use(cors());
app.use(express.json());

//route
app.use("/api", groupsRouter);
app.use("/api", authRoute);
app.use("/api/devices", devicesRouter);
// const GetDevice = require("./routes/mqtt");


// app.use("/api", GetDevice);



  // Proxy to Shelly devices
const DEVICES_PATH = process.env.DEVICES_PATH || path.join(__dirname, './data/devices.json');
app.use('/shelly', express.raw({ type: '*/*', limit: '1mb' }));

app.use(createProxyRouter({ devicesPath: DEVICES_PATH }));

const PORT = process.env.PORT|| 4000;;
app.listen(PORT, () => console.log("✅ Server running on port", PORT));
