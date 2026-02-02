
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-slate-950 text-white rounded-lg">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-slate-400 mb-6 max-w-md">
            We encountered an unexpected error. Please try refreshing the page.
            {import.meta.env.DEV && (
              <span className="block mt-2 text-xs text-red-400 bg-red-950/50 p-2 rounded">
                {this.state.error?.toString()}
              </span>
            )}
          </p>
          <Button onClick={this.handleRetry} variant="outline" className="border-slate-700 hover:bg-slate-800 text-white gap-2">
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
