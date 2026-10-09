import React, { ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { APP_VERSION } from './types'; // Import APP_VERSION

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    console.log(`Christian Culture App v${APP_VERSION} Error. Please report.`); // Użycie APP_VERSION
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px', 
          color: '#fff', 
          backgroundColor: '#000', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h1 style={{color: '#C5A059', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px'}}>Błąd Aplikacji</h1>
          <pre style={{
            backgroundColor: '#111', 
            padding: '20px', 
            borderRadius: '16px', 
            color: '#ef4444', 
            maxWidth: '90%', 
            overflow: 'auto',
            fontSize: '12px',
            border: '1px solid #333'
          }}>
            {this.state.error?.message || 'Nieznany błąd'}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '30px', 
              padding: '16px 32px', 
              backgroundColor: '#C5A059', 
              color: '#000', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontWeight: '900',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}>
            Odśwież
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);