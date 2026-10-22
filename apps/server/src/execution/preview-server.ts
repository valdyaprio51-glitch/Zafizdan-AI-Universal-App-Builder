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

  async startPreview(projectId: string, port: number, appName = 'Universal AI Generated App'): Promise<string> {
    // Stop any existing preview for this project
    await this.stopPreview(projectId);

    // Initial in-memory state for the running application
    let products = [
      { id: 1, name: 'Industrial Sensor X-100', sku: 'SENS-100', price: 249.99, stockQuantity: 85, category: 'Hardware' },
      { id: 2, name: 'Microcontroller Core V3', sku: 'MCU-003', price: 45.5, stockQuantity: 320, category: 'Electronics' },
      { id: 3, name: 'Heavy Duty Servo Motor', sku: 'SRV-500', price: 115.0, stockQuantity: 40, category: 'Robotics' },
      { id: 4, name: 'Optic Fiber Transceiver', sku: 'OPT-10G', price: 89.0, stockQuantity: 12, category: 'Networking' },
    ];

    const server = http.createServer((req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() }));
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
            const newProduct = JSON.parse(body);
            newProduct.id = products.length + 1;
            products.push(newProduct);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newProduct));
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
          }
        });
        return;
      }

      // Default: Serve Live Interactive Application UI
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - Live Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #0b0f19; color: #f1f5f9; padding: 2rem; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.5rem; background: #064e3b; color: #34d399; font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.75rem; rounded: 9999px; border: 1px solid #059669; }
    .dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: #131b2e; border: 1px solid #1e293b; padding: 1.25rem; border-radius: 0.75rem; }
    .stat-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
    .stat-val { font-size: 1.75rem; font-weight: bold; margin-top: 0.5rem; color: #38bdf8; }
    .table-container { background: #131b2e; border: 1px solid #1e293b; border-radius: 0.75rem; overflow: hidden; }
    .table-header { padding: 1rem 1.5rem; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
    th { padding: 0.75rem 1.5rem; background: #0f172a; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #1e293b; }
    td { padding: 1rem 1.5rem; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
    tr:last-child td { border-bottom: none; }
    .stock-badge { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .in-stock { background: #064e3b; color: #6ee7b7; }
    .low-stock { background: #78350f; color: #fde68a; }
    .btn { background: #0284c7; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.8rem; }
    .btn:hover { background: #0369a1; }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); align-items: center; justify-content: center; z-index: 100; }
    .modal-box { background: #1e293b; border: 1px solid #334155; padding: 1.5rem; border-radius: 0.75rem; width: 340px; }
    .input { width: 100%; background: #0f172a; border: 1px solid #334155; color: white; padding: 0.5rem; border-radius: 0.375rem; margin-top: 0.5rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="font-size: 1.5rem; font-weight: bold; color: #f8fafc;">${appName}</h1>
      <p style="color: #94a3b8; font-size: 0.875rem; margin-top: 0.25rem;">Universal AI Isolated Sandbox Runtime</p>
    </div>
    <div style="display: flex; gap: 0.75rem; align-items: center;">
      <span class="badge"><span class="dot"></span> Process Active (Port ${port})</span>
      <button class="btn" onclick="openModal()">+ Add Product</button>
    </div>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Total Catalog Items</div>
      <div class="stat-val" id="totalItems">4</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Inventory Units</div>
      <div class="stat-val" id="totalUnits" style="color: #4ade80;">457</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Inventory Valuation</div>
      <div class="stat-val" id="totalValue" style="color: #a78bfa;">$41,477.15</div>
    </div>
  </div>

  <div class="table-container">
    <div class="table-header">
      <h3 style="font-size: 1rem; font-weight: 600;">Product Inventory Ledger</h3>
      <span style="font-size: 0.75rem; color: #94a3b8;">Connected to REST API: /api/products</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Product Name</th>
          <th>SKU</th>
          <th>Price</th>
          <th>Stock Units</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="tableBody"></tbody>
    </table>
  </div>

  <div id="modal" class="modal">
    <div class="modal-box">
      <h3 style="margin-bottom: 1rem; font-size: 1rem;">Add New Product</h3>
      <label style="font-size: 0.75rem; color: #94a3b8;">Product Name</label>
      <input id="nameInput" class="input" placeholder="e.g. Servo Driver V2" />
      <label style="font-size: 0.75rem; color: #94a3b8;">SKU Code</label>
      <input id="skuInput" class="input" placeholder="e.g. SRV-002" />
      <label style="font-size: 0.75rem; color: #94a3b8;">Price ($)</label>
      <input id="priceInput" type="number" class="input" placeholder="49.99" />
      <label style="font-size: 0.75rem; color: #94a3b8;">Stock Quantity</label>
      <input id="stockInput" type="number" class="input" placeholder="50" />
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
        <button class="btn" style="background: #475569;" onclick="closeModal()">Cancel</button>
        <button class="btn" onclick="saveProduct()">Save</button>
      </div>
    </div>
  </div>

  <script>
    async function loadData() {
      const res = await fetch('/api/products');
      const items = await res.json();
      
      document.getElementById('totalItems').innerText = items.length;
      const units = items.reduce((a, b) => a + (b.stockQuantity || 0), 0);
      document.getElementById('totalUnits').innerText = units.toLocaleString();
      const val = items.reduce((a, b) => a + (b.price * (b.stockQuantity || 0)), 0);
      document.getElementById('totalValue').innerText = '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = items.map(p => \`
        <tr>
          <td style="color: #64748b;">#\${p.id}</td>
          <td style="font-weight: 600; color: #f8fafc;">\${p.name}</td>
          <td style="font-family: monospace;">\${p.sku}</td>
          <td>$\${p.price.toFixed(2)}</td>
          <td style="font-weight: 600;">\${p.stockQuantity}</td>
          <td>
            <span class="stock-badge \${p.stockQuantity > 20 ? 'in-stock' : 'low-stock'}">
              \${p.stockQuantity > 20 ? 'In Stock' : 'Low Stock'}
            </span>
          </td>
        </tr>
      \`).join('');
    }

    function openModal() { document.getElementById('modal').style.display = 'flex'; }
    function closeModal() { document.getElementById('modal').style.display = 'none'; }

    async function saveProduct() {
      const name = document.getElementById('nameInput').value;
      const sku = document.getElementById('skuInput').value;
      const price = parseFloat(document.getElementById('priceInput').value) || 0;
      const stockQuantity = parseInt(document.getElementById('stockInput').value) || 0;

      if (!name || !sku) return alert('Name and SKU required');

      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sku, price, stockQuantity })
      });

      closeModal();
      loadData();
    }

    loadData();
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
