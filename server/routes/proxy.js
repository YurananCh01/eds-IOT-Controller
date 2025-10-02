// server/routes/proxy.js
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

module.exports = function createProxyRouter(opts = {}) {
  const router = express.Router();
  const DEVICES_PATH = opts.devicesPath;

  function loadDevices() {
    try { return JSON.parse(fs.readFileSync(DEVICES_PATH, 'utf8')); }
    catch (e) { console.error('[devices] read error:', e.message, 'PATH=', DEVICES_PATH); return {}; }
  }

  // =========================
  // 1) Proxy: /shelly/:alias/*
  // =========================
  router.use('/shelly/:alias', (req, res) => {
    const { alias } = req.params;
    const map = loadDevices();
    const base = map[alias];
    if (!base) {
      return res.status(404).json({ error: `Unknown alias: ${alias}`, DEVICES_PATH });
    }

    let target;
    try { target = new URL(base); }
    catch { return res.status(500).json({ error: 'Invalid base URL in devices.json', base }); }

    // path ปลายทาง = originalUrl - '/shelly/<alias>'
    const prefix = `/shelly/${alias}`;
    const fwdPath = req.originalUrl.startsWith(prefix)
      ? req.originalUrl.slice(prefix.length) || '/'
      : '/';

    const isHttps = target.protocol === 'https:';
    const agent = isHttps ? new https.Agent({ keepAlive: false }) : new http.Agent({ keepAlive: false });

    const bodyBuf = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const headers = {
      ...req.headers,
      host: target.host,
      connection: 'close',
      'content-length': bodyBuf.length,
    };
    delete headers['transfer-encoding'];
    delete headers['Transfer-Encoding'];

    const options = {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      method: req.method,
      path: fwdPath,
      headers,
      agent,
      timeout: 15000,
    };

    const upstream = (isHttps ? https : http).request(options, (upRes) => {
      res.status(upRes.statusCode || 502);
      // ส่ง header กลับ (ยกเว้น hop-by-hop)
      Object.entries(upRes.headers || {}).forEach(([k, v]) => {
        if (k.toLowerCase() !== 'transfer-encoding' && typeof v !== 'undefined') res.setHeader(k, v);
      });
      upRes.pipe(res);
    });

    upstream.on('timeout', () => upstream.destroy(new Error('Upstream timeout')));
    upstream.on('error', (err) => {
      console.error('Upstream error:', err.message);
      if (!res.headersSent) res.status(502).json({ error: 'Bad gateway', detail: err.message });
      else try { res.end(); } catch {}
    });

    if (bodyBuf.length) upstream.write(bodyBuf);
    upstream.end();
  });

  // =========================
  // 2) REST: สั่งงาน / ดูสถานะ
  // =========================

  async function shellyRpcCall(alias, rpcBody) {
    const map = loadDevices();
    const base = map[alias];
    if (!base) {
      const err = new Error(`Unknown alias: ${alias}`);
      err.status = 404; throw err;
    }
    let target;
    try { target = new URL(base); }
    catch {
      const err = new Error(`Invalid base URL for alias "${alias}"`);
      err.status = 500; throw err;
    }

    const isHttps = target.protocol === 'https:';
    const bodyStr = JSON.stringify(rpcBody);
    const opts = {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      method: 'POST',
      path: '/rpc',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Connection': 'close',
      },
      timeout: 15000,
      agent: isHttps ? new https.Agent({ keepAlive: false }) : new http.Agent({ keepAlive: false }),
    };
    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const req = client.request(opts, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data || '{}');
            if (res.statusCode >= 400) {
              const e = new Error(`Upstream HTTP ${res.statusCode}`);
              e.detail = json; e.status = 502; return reject(e);
            }
            if (json.error) {
              const e = new Error('Shelly RPC error');
              e.detail = json.error; e.status = 502; return reject(e);
            }
            resolve(json.result ?? json);
          } catch (e) {
            const err = new Error('Invalid JSON from device');
            err.detail = data; err.status = 502; reject(err);
          }
        });
      });
      req.on('timeout', () => req.destroy(new Error('Upstream timeout')));
      req.on('error', (err) => reject(err));
      req.write(bodyStr);
      req.end();
    });
  }

  // ดูสถานะทั้งเครื่อง
  router.get('/api/devices/:alias/status', async (req, res) => {
    try {
      const result = await shellyRpcCall(req.params.alias, { id: Date.now(), method: 'Shelly.GetStatus' });
      res.json(result);
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message, detail: e.detail });
    }
  });

  // ดูสถานะช่องเดียว
  router.get('/api/devices/:alias/switch/:id/status', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await shellyRpcCall(req.params.alias, { id: Date.now(), method: 'Switch.GetStatus', params: { id } });
      res.json(result);
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message, detail: e.detail });
    }
  });

  // เปิด
  router.post('/api/devices/:alias/switch/:id/on', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await shellyRpcCall(req.params.alias, { id: Date.now(), method: 'Switch.Set', params: { id, on: true } });
      res.json(result);
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message, detail: e.detail });
    }
  });

  // ปิด
  router.post('/api/devices/:alias/switch/:id/off', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await shellyRpcCall(req.params.alias, { id: Date.now(), method: 'Switch.Set', params: { id, on: false } });
      res.json(result);
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message, detail: e.detail });
    }
  });

  // สลับ (toggle)
  router.post('/api/devices/:alias/switch/:id/toggle', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await shellyRpcCall(req.params.alias, { id: Date.now(), method: 'Switch.Toggle', params: { id } });
      res.json(result);
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message, detail: e.detail });
    }
  });

  // =========================
  // 3) ยูทิลิตี้: devices + debug
  // =========================

  router.get('/devices', (req, res) => {
    const map = loadDevices();
    res.json({ devices: Object.entries(map).map(([alias, baseUrl]) => ({ alias, baseUrl })) });
  });

  router.get('/debug/devices-path', (req, res) => {
    const map = loadDevices();
    res.json({ DEVICES_PATH, keys: Object.keys(map) });
  });

  // ใส่ express.json เฉพาะ route ที่ต้อง parse body
  router.put('/devices/:alias', express.json(), (req, res) => {
    const { alias } = req.params;
    const { baseUrl } = req.body || {};
    if (!baseUrl || !/^https?:\/\/.+/.test(baseUrl)) {
      return res.status(400).json({ error: 'baseUrl is required (http/https)' });
    }
    const map = loadDevices();
    map[alias] = baseUrl;
    fs.writeFileSync(DEVICES_PATH, JSON.stringify(map, null, 2));
    res.json({ ok: true, alias, baseUrl });
  });

  router.delete('/devices/:alias', (req, res) => {
    const { alias } = req.params;
    const map = loadDevices();
    if (!map[alias]) return res.status(404).json({ error: 'alias not found' });
    delete map[alias];
    fs.writeFileSync(DEVICES_PATH, JSON.stringify(map, null, 2));
    res.json({ ok: true });
  });

  return router;
};
