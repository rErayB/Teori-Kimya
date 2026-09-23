import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07111F] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0B1B2E] border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Bir Hata Oluştu</h2>
            <p className="text-sm text-slate-400">
              Uygulama çalışırken beklenmedik bir arayüz hatası yakalandı. Sistem verileriniz güvendedir.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-slate-950/60 p-3 rounded-lg text-red-300 text-left overflow-x-auto max-h-32 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2">
              <Button onClick={this.handleReset} icon={<RefreshCw className="w-4 h-4" />}>
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
