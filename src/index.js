// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import 'leaflet/dist/leaflet.css';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div role="alert" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Terjadi Kesalahan! 😢</h2>
      <pre style={{ 
        color: 'red',
        backgroundColor: '#ffe6e6',
        padding: '15px',
        borderRadius: '5px'
      }}>
        {error.message}
      </pre>
      <p>Coba refresh halaman atau coba beberapa saat lagi</p>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);