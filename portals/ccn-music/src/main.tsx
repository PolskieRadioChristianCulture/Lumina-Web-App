import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class MusicErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error('CC Music render failed:', error); }
  render() {
    if (this.state.failed) return (
      <main style={{ maxWidth: 540, margin: '3rem auto', padding: 24, fontFamily: 'system-ui', color: '#20201d', background: '#fff', textAlign: 'center' }}>
        <h1>CHRISTIAN CULTURE MUSIC</h1>
        <p>Wystąpił problem z wyświetleniem odtwarzacza.</p>
        <button
          onClick={() => window.location.reload()}
          style={{ background: '#bb142e', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', marginTop: 16 }}
        >
          Odśwież stronę
        </button>
      </main>
    );
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <MusicErrorBoundary>
    <App />
  </MusicErrorBoundary>
);
