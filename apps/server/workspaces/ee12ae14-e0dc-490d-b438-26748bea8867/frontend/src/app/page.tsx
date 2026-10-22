'use client';
import React, { useState, useEffect } from 'react';

export default function InventoryDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>Universal Inventory SaaS</h1>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Real-time stock management and analytics engine</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ backgroundColor: '#10b981', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>API Connected</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Items</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{products.length}</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Inventory Units</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#38bdf8' }}>
            {products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0)}
          </div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Inventory Value</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#4ade80' }}>
            ${products.reduce((acc, p) => acc + (p.price * (p.stockQuantity || 0)), 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Stock Inventory List</h2>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading inventory items...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>ID</th>
                <th style={{ padding: '1rem 1.5rem' }}>Product Name</th>
                <th style={{ padding: '1rem 1.5rem' }}>SKU</th>
                <th style={{ padding: '1rem 1.5rem' }}>Price</th>
                <th style={{ padding: '1rem 1.5rem' }}>Quantity</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#94a3b8' }}>#{item.id}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace' }}>{item.sku}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>${item.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{item.stockQuantity}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      backgroundColor: item.stockQuantity > 50 ? '#064e3b' : '#78350f',
                      color: item.stockQuantity > 50 ? '#6ee7b7' : '#fcd34d',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {item.stockQuantity > 50 ? 'In Stock' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
