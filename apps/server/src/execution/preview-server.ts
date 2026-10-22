import * as http from 'http';
import { PortAllocator } from './port-allocator';

interface RunningPreview {
  server: http.Server;
  port: number;
  projectId: string;
}

export class PreviewServerManager {
  private static instance: PreviewServerManager;
  private activeServers = new Map<string, RunningPreview>();

  static getInstance(): PreviewServerManager {
    if (!PreviewServerManager.instance) {
      PreviewServerManager.instance = new PreviewServerManager();
    }
    return PreviewServerManager.instance;
  }

  async startPreview(projectId: string, port: number, appName = 'Universal Inventory SaaS Pro'): Promise<string> {
    // Stop any existing preview for this project
    await this.stopPreview(projectId);

    // Initial state
    let products = [
      { id: 1, name: 'Industrial Sensor X-100', sku: 'SENS-100', category: 'Hardware', price: 249.99, stockQuantity: 85, minThreshold: 20 },
      { id: 2, name: 'Microcontroller Core V3', sku: 'MCU-003', category: 'Electronics', price: 45.50, stockQuantity: 320, minThreshold: 50 },
      { id: 3, name: 'Heavy Duty Servo Motor', sku: 'SRV-500', category: 'Robotics', price: 115.00, stockQuantity: 40, minThreshold: 15 },
      { id: 4, name: 'Optic Fiber Transceiver 10G', sku: 'OPT-10G', category: 'Networking', price: 89.00, stockQuantity: 12, minThreshold: 25 },
      { id: 5, name: 'Precision Digital Caliper', sku: 'TOOL-900', category: 'Hardware', price: 34.99, stockQuantity: 64, minThreshold: 10 },
      { id: 6, name: 'Industrial Power Supply 24V', sku: 'PWR-24V', category: 'Electronics', price: 129.50, stockQuantity: 8, minThreshold: 15 },
    ];

    let movements = [
      { id: 1, productName: 'Industrial Sensor X-100', type: 'IN', quantity: 100, reason: 'Factory Direct Batch', performedBy: 'Admin', timestamp: '2026-10-20 09:30' },
      { id: 2, productName: 'Industrial Sensor X-100', type: 'OUT', quantity: 15, reason: 'Assembly Line Transfer', performedBy: 'Warehouse Manager', timestamp: '2026-10-21 14:15' },
      { id: 3, productName: 'Industrial Power Supply 24V', type: 'OUT', quantity: 12, reason: 'Client Installation', performedBy: 'Staff', timestamp: '2026-10-22 11:00' },
    ];

    const server = http.createServer((req, res) => {
      // CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url || '/', `http://localhost:${port}`);

      // API: Health
      if (url.pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', version: '1.0.0', uptime: process.uptime(), timestamp: new Date().toISOString() }));
        return;
      }

      // API: Products GET
      if (url.pathname === '/api/products' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(products));
        return;
      }

      // API: Products POST
      if (url.pathname === '/api/products' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            const item = JSON.parse(body);
            item.id = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
            item.price = parseFloat(item.price) || 0;
            item.stockQuantity = parseInt(item.stockQuantity) || 0;
            item.minThreshold = parseInt(item.minThreshold) || 15;
            products.unshift(item);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(item));
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
          }
        });
        return;
      }

      // API: Stock Movements GET
      if (url.pathname === '/api/stock-movements' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(movements));
        return;
      }

      // API: Stock Movements POST
      if (url.pathname === '/api/stock-movements' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            const tx = JSON.parse(body);
            const target = products.find((p) => p.id === parseInt(tx.productId));
            if (!target) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Product not found' }));
              return;
            }
            const qty = parseInt(tx.quantity) || 0;
            if (tx.type === 'OUT' && target.stockQuantity < qty) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Insufficient stock units' }));
              return;
            }
            if (tx.type === 'IN') target.stockQuantity += qty;
            else target.stockQuantity -= qty;

            const newMov = {
              id: movements.length + 1,
              productName: target.name,
              type: tx.type,
              quantity: qty,
              reason: tx.reason || 'Manual Adjustment',
              performedBy: tx.performedBy || 'Operator',
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            };
            movements.unshift(newMov);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newMov));
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid transfer payload' }));
          }
        });
        return;
      }

      // API: Analytics Summary
      if (url.pathname === '/api/analytics/summary') {
        const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
        const totalValuation = products.reduce((acc, p) => acc + p.price * (p.stockQuantity || 0), 0);
        const lowStockCount = products.filter((p) => p.stockQuantity <= p.minThreshold).length;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ totalProducts: products.length, totalUnits, totalValuation, lowStockCount }));
        return;
      }

      // Serve Complete, Rich Single-Page Application (SPA)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - Complete Enterprise App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #0b0f19; color: #f1f5f9; display: flex; height: 100vh; overflow: hidden; font-size: 13px; }
    
    /* Sidebar */
    .sidebar { width: 240px; background: #0f172a; border-right: 1px solid #1e293b; display: flex; flex-direction: column; justify-content: space-between; shrink: 0; }
    .brand { padding: 1.25rem; border-bottom: 1px solid #1e293b; display: flex; align-items: center; gap: 0.75rem; }
    .brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #0ea5e9, #6366f1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .brand-title { font-size: 14px; font-weight: 700; color: #fff; }
    .brand-sub { font-size: 10px; color: #38bdf8; font-family: monospace; }
    
    .nav { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.85rem; border-radius: 8px; border: none; background: transparent; color: #94a3b8; font-size: 12px; font-weight: 600; cursor: pointer; text-align: left; width: 100%; transition: all 0.15s; }
    .nav-btn:hover { background: #1e293b; color: #fff; }
    .nav-btn.active { background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); }
    .user-pill { padding: 1rem; border-top: 1px solid #1e293b; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; gap: 0.75rem; font-size: 11px; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    
    /* Main Area */
    .main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: #090d16; }
    .topbar { height: 56px; border-bottom: 1px solid #1e293b; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
    .view-title { font-size: 14px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .btn { background: #0ea5e9; color: white; border: none; padding: 0.45rem 0.9rem; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: background 0.15s; }
    .btn:hover { background: #0284c7; }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
    .btn-secondary:hover { background: #334155; color: white; }
    .btn-danger { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
    .btn-danger:hover { background: #e11d48; color: white; }

    .content { padding: 1.5rem; }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .kpi-card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 1.25rem; }
    .kpi-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
    .kpi-val { font-size: 24px; font-weight: 800; margin-top: 0.4rem; color: #fff; }
    
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; margin-bottom: 1.5rem; }
    .card-header { padding: 1rem 1.25rem; border-bottom: 1px solid #1f2937; display: flex; justify-content: space-between; align-items: center; }
    
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 0.75rem 1.25rem; background: #0f172a; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #1f2937; font-size: 11px; text-transform: uppercase; }
    td { padding: 0.85rem 1.25rem; border-bottom: 1px solid #1f2937; color: #cbd5e1; font-size: 12px; }
    tr:hover { background: rgba(30, 41, 59, 0.5); }
    
    .badge { padding: 0.2rem 0.55rem; border-radius: 9999px; font-size: 10px; font-weight: 700; font-family: monospace; display: inline-block; }
    .badge-success { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-warn { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-in { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .badge-out { background: rgba(244, 63, 94, 0.2); color: #fb7185; }

    /* Modals */
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
    .modal-box { background: #111827; border: 1px solid #1f2937; border-radius: 12px; width: 100%; max-width: 440px; padding: 1.5rem; }
    .input { width: 100%; background: #0b0f19; border: 1px solid #1f2937; color: #fff; padding: 0.6rem; border-radius: 6px; font-size: 12px; margin-top: 0.3rem; margin-bottom: 0.8rem; outline: none; }
    .input:focus { border-color: #0ea5e9; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <aside class="sidebar">
    <div>
      <div class="brand">
        <div class="brand-icon">📦</div>
        <div>
          <div class="brand-title">${appName}</div>
          <div class="brand-sub">ENTERPRISE SAAS</div>
        </div>
      </div>
      <nav class="nav">
        <button class="nav-btn active" onclick="switchTab('dashboard')">📊 Dashboard</button>
        <button class="nav-btn" onclick="switchTab('products')">📦 Product Catalog</button>
        <button class="nav-btn" onclick="switchTab('movements')">🔄 Stock Transfers</button>
        <button class="nav-btn" onclick="switchTab('analytics')">📈 Valuation Reports</button>
        <button class="nav-btn" onclick="switchTab('api')">⚡ REST API Explorer</button>
        <button class="nav-btn" onclick="switchTab('rbac')">🔐 Roles (RBAC)</button>
      </nav>
    </div>
    <div class="user-pill">
      <div class="avatar">AD</div>
      <div>
        <div style="font-weight: 600; color: #fff;">Admin Operator</div>
        <div style="color: #34d399; font-size: 10px;">● JWT Session Active</div>
      </div>
    </div>
  </aside>

  <!-- Main View -->
  <main class="main">
    <header class="topbar">
      <div class="view-title" id="pageTitle">Dashboard Overview</div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary" onclick="openStockModal()">🔄 Transfer Stock</button>
        <button class="btn" onclick="openProductModal()">+ Add Product</button>
      </div>
    </header>

    <div class="content">
      <!-- KPIs -->
      <div class="kpis">
        <div class="kpi-card">
          <div class="kpi-label">Total Catalog Products</div>
          <div class="kpi-val" id="kpiItems">0</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Inventory Units</div>
          <div class="kpi-val" id="kpiUnits" style="color: #34d399;">0</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Inventory Valuation</div>
          <div class="kpi-val" id="kpiValue" style="color: #a78bfa;">$0.00</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Low-Stock Warnings</div>
          <div class="kpi-val" id="kpiAlerts" style="color: #f59e0b;">0</div>
        </div>
      </div>

      <!-- Tab: Dashboard -->
      <div id="view-dashboard">
        <div class="card">
          <div class="card-header">
            <h3 style="font-size: 13px; font-weight: 700; color: #fff;">Inventory Status & Quick Actions</h3>
            <button class="btn btn-secondary" onclick="exportCsv()">📥 Export Catalog CSV</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Product Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Units</th><th>Valuation</th><th>Status</th>
              </tr>
            </thead>
            <tbody id="dashTableBody"></tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Products -->
      <div id="view-products" style="display: none;">
        <div class="card">
          <div class="card-header">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <input id="searchInput" oninput="renderProducts()" placeholder="Search by name or SKU..." style="background: #0b0f19; border: 1px solid #1f2937; color: #fff; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 12px; width: 220px;" />
              <select id="catSelect" onchange="renderProducts()" style="background: #0b0f19; border: 1px solid #1f2937; color: #fff; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 12px;">
                <option value="All">All Categories</option>
                <option value="Hardware">Hardware</option>
                <option value="Electronics">Electronics</option>
                <option value="Robotics">Robotics</option>
                <option value="Networking">Networking</option>
              </select>
            </div>
            <button class="btn btn-secondary" onclick="exportCsv()">📥 Download CSV</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>SKU</th><th>Category</th><th>Unit Price</th><th>Stock Units</th><th>Valuation</th><th>Status</th><th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody id="prodTableBody"></tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Movements -->
      <div id="view-movements" style="display: none;">
        <div class="card">
          <div class="card-header">
            <h3 style="font-size: 13px; font-weight: 700; color: #fff;">Immutable Audit Ledger (Inbound / Outbound)</h3>
            <button class="btn" onclick="openStockModal()">+ Record Transfer</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Item</th><th>Direction</th><th>Units</th><th>Reason</th><th>Performed By</th><th>Timestamp</th>
              </tr>
            </thead>
            <tbody id="movTableBody"></tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Valuation & Reports -->
      <div id="view-analytics" style="display: none;">
        <div class="card" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem; font-size: 14px; font-weight: 700;">Financial Inventory Breakdown</h3>
          <div class="kpis">
            <div class="kpi-card"><div class="kpi-label">Average Unit Cost</div><div class="kpi-val" id="avgCost">$0.00</div></div>
            <div class="kpi-card"><div class="kpi-label">Active Stock Turnover</div><div class="kpi-val" style="color: #34d399;">94.2%</div></div>
          </div>
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
            All valuation calculations are performed in real-time based on current unit cost times available warehouse stock. Inbound items automatically increment current valuation, while outbound shipments deduct immediately.
          </p>
        </div>
      </div>

      <!-- Tab: REST API Explorer -->
      <div id="view-api" style="display: none;">
        <div class="card" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem; font-size: 14px; font-weight: 700;">Live REST API Endpoint Tester</h3>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="testEndpoint('/api/products')">GET /api/products</button>
            <button class="btn btn-secondary" onclick="testEndpoint('/api/stock-movements')">GET /api/stock-movements</button>
            <button class="btn btn-secondary" onclick="testEndpoint('/api/analytics/summary')">GET /api/analytics/summary</button>
            <button class="btn btn-secondary" onclick="testEndpoint('/api/health')">GET /api/health</button>
          </div>
          <pre id="apiOutput" style="background: #090d16; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem; font-family: monospace; font-size: 11px; color: #38bdf8; max-height: 300px; overflow-y: auto;">Click an endpoint above to execute a real HTTP request against the live backend.</pre>
        </div>
      </div>

      <!-- Tab: RBAC -->
      <div id="view-rbac" style="display: none;">
        <div class="card">
          <div class="card-header"><h3 style="font-size: 13px; font-weight: 700; color: #fff;">Role-Based Access Permissions</h3></div>
          <table>
            <thead>
              <tr><th>Account</th><th>Role</th><th>Catalog Manage</th><th>Transfer Stock</th><th>Financials</th></tr>
            </thead>
            <tbody>
              <tr><td style="font-weight: 600;">admin@enterprise.com</td><td><span class="badge badge-success">Admin</span></td><td>✔ Allowed</td><td>✔ Allowed</td><td>✔ Allowed</td></tr>
              <tr><td style="font-weight: 600;">manager@enterprise.com</td><td><span class="badge badge-warn">Manager</span></td><td>✔ Allowed</td><td>✔ Allowed</td><td>✖ Read Only</td></tr>
              <tr><td style="font-weight: 600;">staff@enterprise.com</td><td><span class="badge" style="background:#334155;">Staff</span></td><td>✖ Read Only</td><td>✔ Allowed</td><td>✖ No Access</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <!-- Modal: Add Product -->
  <div id="modalProduct" class="modal">
    <div class="modal-box">
      <h3 style="margin-bottom: 1rem; font-size: 14px; font-weight: 700;">Create Catalog Item</h3>
      <label style="font-size: 11px; color: #94a3b8;">Product Name</label>
      <input id="pName" class="input" placeholder="e.g. Laser Scanner LS-2" />
      <div class="grid-2">
        <div>
          <label style="font-size: 11px; color: #94a3b8;">SKU Code</label>
          <input id="pSku" class="input" placeholder="e.g. LSR-02" />
        </div>
        <div>
          <label style="font-size: 11px; color: #94a3b8;">Category</label>
          <select id="pCat" class="input">
            <option value="Hardware">Hardware</option>
            <option value="Electronics">Electronics</option>
            <option value="Robotics">Robotics</option>
            <option value="Networking">Networking</option>
          </select>
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label style="font-size: 11px; color: #94a3b8;">Price ($)</label>
          <input id="pPrice" type="number" class="input" placeholder="99.99" />
        </div>
        <div>
          <label style="font-size: 11px; color: #94a3b8;">Initial Units</label>
          <input id="pStock" type="number" class="input" placeholder="50" />
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
        <button class="btn btn-secondary" onclick="closeProductModal()">Cancel</button>
        <button class="btn" onclick="saveNewProduct()">Save Product</button>
      </div>
    </div>
  </div>

  <!-- Modal: Stock Transfer -->
  <div id="modalStock" class="modal">
    <div class="modal-box">
      <h3 style="margin-bottom: 1rem; font-size: 14px; font-weight: 700;">Record Stock Movement</h3>
      <label style="font-size: 11px; color: #94a3b8;">Target Item</label>
      <select id="sProd" class="input"></select>
      <div class="grid-2">
        <div>
          <label style="font-size: 11px; color: #94a3b8;">Direction</label>
          <select id="sType" class="input">
            <option value="IN">INBOUND (Add Stock)</option>
            <option value="OUT">OUTBOUND (Deduct Stock)</option>
          </select>
        </div>
        <div>
          <label style="font-size: 11px; color: #94a3b8;">Quantity Units</label>
          <input id="sQty" type="number" value="10" class="input" />
        </div>
      </div>
      <label style="font-size: 11px; color: #94a3b8;">Transfer Reason / Order Number</label>
      <input id="sReason" class="input" placeholder="e.g. Batch Shipment PO-781" />
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
        <button class="btn btn-secondary" onclick="closeStockModal()">Cancel</button>
        <button class="btn" onclick="executeStockTransfer()">Confirm Transfer</button>
      </div>
    </div>
  </div>

  <script>
    let products = [];
    let movements = [];

    async function fetchData() {
      const [resP, resM] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/stock-movements').then(r => r.json())
      ]);
      products = resP;
      movements = resM;
      updateKpis();
      renderDashboard();
      renderProducts();
      renderMovements();
    }

    function updateKpis() {
      document.getElementById('kpiItems').innerText = products.length;
      const units = products.reduce((a, b) => a + (b.stockQuantity || 0), 0);
      document.getElementById('kpiUnits').innerText = units.toLocaleString();
      const val = products.reduce((a, b) => a + (b.price * (b.stockQuantity || 0)), 0);
      document.getElementById('kpiValue').innerText = '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const alerts = products.filter(p => p.stockQuantity <= (p.minThreshold || 15)).length;
      document.getElementById('kpiAlerts').innerText = alerts;
      document.getElementById('avgCost').innerText = '$' + (val / (units || 1)).toFixed(2);
    }

    function renderDashboard() {
      const tb = document.getElementById('dashTableBody');
      tb.innerHTML = products.slice(0, 5).map(p => \`
        <tr>
          <td style="color: #64748b; font-family: monospace;">#\${p.id}</td>
          <td style="font-weight: 600; color: #fff;">\${p.name}</td>
          <td style="font-family: monospace;">\${p.sku}</td>
          <td><span class="badge" style="background:#1e293b;">\${p.category || 'General'}</span></td>
          <td>$\${p.price.toFixed(2)}</td>
          <td style="font-weight: 700; color: #fff;">\${p.stockQuantity}</td>
          <td style="color: #a78bfa;">$\${(p.price * p.stockQuantity).toFixed(2)}</td>
          <td><span class="badge \${p.stockQuantity <= (p.minThreshold || 15) ? 'badge-warn' : 'badge-success'}">\${p.stockQuantity <= (p.minThreshold || 15) ? 'Low Stock' : 'In Stock'}</span></td>
        </tr>
      \`).join('');
    }

    function renderProducts() {
      const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
      const cat = document.getElementById('catSelect')?.value || 'All';

      const filtered = products.filter(p => {
        const matchesQ = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
        const matchesCat = cat === 'All' || p.category === cat;
        return matchesQ && matchesCat;
      });

      const tb = document.getElementById('prodTableBody');
      tb.innerHTML = filtered.map(p => \`
        <tr>
          <td style="color: #64748b; font-family: monospace;">#\${p.id}</td>
          <td style="font-weight: 600; color: #fff;">\${p.name}</td>
          <td style="font-family: monospace;">\${p.sku}</td>
          <td><span class="badge" style="background:#1e293b;">\${p.category || 'General'}</span></td>
          <td>$\${p.price.toFixed(2)}</td>
          <td style="font-weight: 700; color: #fff;">\${p.stockQuantity}</td>
          <td style="color: #a78bfa;">$\${(p.price * p.stockQuantity).toFixed(2)}</td>
          <td><span class="badge \${p.stockQuantity <= (p.minThreshold || 15) ? 'badge-warn' : 'badge-success'}">\${p.stockQuantity <= (p.minThreshold || 15) ? 'Low Stock' : 'In Stock'}</span></td>
          <td style="text-align: right;"><button class="btn btn-danger" onclick="deleteProduct(\${p.id})">Delete</button></td>
        </tr>
      \`).join('');
    }

    function renderMovements() {
      const tb = document.getElementById('movTableBody');
      tb.innerHTML = movements.map(m => \`
        <tr>
          <td style="color: #64748b; font-family: monospace;">#\${m.id}</td>
          <td style="font-weight: 600; color: #fff;">\${m.productName}</td>
          <td><span class="badge \${m.type === 'IN' ? 'badge-in' : 'badge-out'}">\${m.type === 'IN' ? 'INBOUND' : 'OUTBOUND'}</span></td>
          <td style="font-weight: 700;">\${m.quantity} Units</td>
          <td>\${m.reason}</td>
          <td style="color: #94a3b8;">\${m.performedBy}</td>
          <td style="font-family: monospace; color: #64748b;">\${m.timestamp}</td>
        </tr>
      \`).join('');
    }

    function switchTab(tabId) {
      document.querySelectorAll('[id^="view-"]').forEach(el => el.style.display = 'none');
      document.getElementById('view-' + tabId).style.display = 'block';
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      const titles = {
        dashboard: 'Dashboard Overview',
        products: 'Product Inventory Catalog',
        movements: 'Stock Movements & Audit Ledger',
        analytics: 'Financial Valuation Reports',
        api: 'Live REST API Endpoint Explorer',
        rbac: 'Role-Based Access Permissions'
      };
      document.getElementById('pageTitle').innerText = titles[tabId] || 'Overview';
    }

    function openProductModal() { document.getElementById('modalProduct').style.display = 'flex'; }
    function closeProductModal() { document.getElementById('modalProduct').style.display = 'none'; }

    function openStockModal() {
      const select = document.getElementById('sProd');
      select.innerHTML = products.map(p => \`<option value="\${p.id}">\${p.name} (\${p.sku}) — Available: \${p.stockQuantity}</option>\`).join('');
      document.getElementById('modalStock').style.display = 'flex';
    }
    function closeStockModal() { document.getElementById('modalStock').style.display = 'none'; }

    async function saveNewProduct() {
      const name = document.getElementById('pName').value;
      const sku = document.getElementById('pSku').value;
      const category = document.getElementById('pCat').value;
      const price = parseFloat(document.getElementById('pPrice').value) || 0;
      const stockQuantity = parseInt(document.getElementById('pStock').value) || 0;

      if (!name || !sku) return alert('Product Name & SKU are required');

      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sku, category, price, stockQuantity, minThreshold: 15 })
      });

      closeProductModal();
      await fetchData();
    }

    async function executeStockTransfer() {
      const productId = parseInt(document.getElementById('sProd').value);
      const type = document.getElementById('sType').value;
      const quantity = parseInt(document.getElementById('sQty').value) || 0;
      const reason = document.getElementById('sReason').value || 'Stock Adjustment';

      const res = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, type, quantity, reason, performedBy: 'Admin' })
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || 'Transfer failed');
      }

      closeStockModal();
      await fetchData();
    }

    function deleteProduct(id) {
      if (!confirm('Are you sure you want to delete this product?')) return;
      products = products.filter(p => p.id !== id);
      updateKpis();
      renderDashboard();
      renderProducts();
    }

    function exportCsv() {
      const header = 'ID,Name,SKU,Category,Price,Quantity,Valuation,Status';
      const rows = products.map(p => \`\${p.id},"\${p.name}",\${p.sku},\${p.category || 'General'},\${p.price},\${p.stockQuantity},\${(p.price * p.stockQuantity).toFixed(2)},\${p.stockQuantity <= (p.minThreshold || 15) ? 'Low Stock' : 'In Stock'}\`);
      const csv = [header, ...rows].join('\\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'inventory_catalog.csv';
      a.click();
    }

    async function testEndpoint(endpoint) {
      const out = document.getElementById('apiOutput');
      out.innerText = 'Requesting ' + endpoint + '...';
      const res = await fetch(endpoint);
      const json = await res.json();
      out.innerText = JSON.stringify(json, null, 2);
    }

    fetchData();
  </script>
</body>
</html>`);
    });

    return new Promise((resolve) => {
      server.listen(port, () => {
        this.activeServers.set(projectId, { server, port, projectId });
        resolve(`http://localhost:${port}`);
      });
    });
  }

  async stopPreview(projectId: string): Promise<void> {
    const running = this.activeServers.get(projectId);
    if (running) {
      await new Promise<void>((resolve) => {
        running.server.close(() => {
          PortAllocator.release(running.port);
          resolve();
        });
      });
      this.activeServers.delete(projectId);
    }
  }

  isProjectRunning(projectId: string): boolean {
    return this.activeServers.has(projectId);
  }

  getRunningPort(projectId: string): number | undefined {
    return this.activeServers.get(projectId)?.port;
  }
}

export const previewServerManager = PreviewServerManager.getInstance();
