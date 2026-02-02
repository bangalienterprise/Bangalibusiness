import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2 text-white">Something went wrong</h1>
            <p className="text-slate-400 mb-6">
              We encountered an unexpected error. Our team has been notified.
            </p>

            {/* Fixed: Use import.meta.env.DEV for Vite instead of process.env.NODE_ENV */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-slate-950 rounded text-left overflow-auto max-h-40 text-xs font-mono text-red-300 border border-red-900/30">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleReset} variant="outline" className="border-slate-700 hover:bg-slate-800">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Button onClick={this.handleGoHome} className="bg-blue-600 hover:bg-blue-500">
                <Home className="mr-2 h-4 w-4" /> Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;