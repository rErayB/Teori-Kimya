import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfills and runtime guards for iOS Safari / WebKit
if (typeof window !== 'undefined') {
  // Ensure globalThis is defined (iOS 11/12 compatibility)
  if (typeof (window as any).globalThis === 'undefined') {
    (window as any).globalThis = window;
  }

  // requestIdleCallback polyfill for iOS Safari (supported only from 16.4 onwards)
  if (typeof (window as any).requestIdleCallback === 'undefined') {
    (window as any).requestIdleCallback = (cb: (deadline: any) => void) => {
      const start = Date.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        });
      }, 1);
    };
  }

  if (typeof (window as any).cancelIdleCallback === 'undefined') {
    (window as any).cancelIdleCallback = (id: number) => {
      clearTimeout(id);
    };
  }

  // Prevent uncaught promise rejections from causing blank screens in iOS Safari
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Safari Guard] Unhandled Promise Rejection prevented:', event.reason);
    // Suppress default blanking behavior
    event.preventDefault?.();
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (initErr) {
    console.error('Fatal initialization error:', initErr);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background-color: #07111F; color: #f1f5f9; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center;">
        <div style="max-width: 400px; background-color: #0B1B2E; padding: 28px; border-radius: 16px; border: 1px solid rgba(6, 182, 212, 0.3); box-shadow: 0 20px 25px rgba(0,0,0,0.5);">
          <div style="width: 48px; height: 48px; margin: 0 auto 16px; background-color: rgba(6, 182, 212, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #8DE7F2; font-size: 24px; font-weight: bold;">!</div>
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #ffffff;">Teori Kimya ERP Başlatılıyor</h2>
          <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px; line-height: 1.5;">Tarayıcınız sistem verilerini hazırlarken bir gecikme oluştu. Sayfayı yenileyerek sistemi açabilirsiniz.</p>
          <button onclick="window.location.reload()" style="background-color: #06b6d4; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer;">Yeniden Başlat</button>
        </div>
      </div>
    `;
  }
}
