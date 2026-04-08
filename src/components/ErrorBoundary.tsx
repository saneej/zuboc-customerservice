import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-8">
              The application encountered an unexpected error. This might be due to missing configuration or a temporary issue.
            </p>
            
            {this.state.error && (
              <div className="bg-slate-50 rounded-lg p-4 mb-8 text-left overflow-auto max-h-32">
                <code className="text-xs text-rose-600 font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reload Application
            </button>
            
            <p className="mt-6 text-xs text-slate-400">
              If the problem persists, please check your Supabase configuration in the secrets panel.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
