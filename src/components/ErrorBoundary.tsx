import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public state: State;

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050811] text-[#f3f4f6] flex flex-col items-center justify-center p-6 font-sans">
          <div className="bg-[#0b1329] border border-red-500/20 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500" />
            
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight mb-2">
              An unexpected error occurred
            </h1>
            
            <p className="text-sm text-gray-400 mb-6">
              The application encountered a runtime issue. This can sometimes happen if sheet structures are altered or if authorization data is corrupt.
            </p>

            {this.state.error && (
              <div className="bg-[#080d1a] border border-[#1e293b] rounded-xl p-4 mb-6 text-left overflow-x-auto max-h-40">
                <p className="text-xs font-mono text-rose-400 leading-relaxed break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#1f2937] hover:bg-[#2d3748] border border-gray-700/50 text-white text-xs font-semibold rounded-lg cursor-pointer transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#050811] text-xs font-bold rounded-lg cursor-pointer transition"
              >
                Clear Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
