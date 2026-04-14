import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "দুঃখিত, একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।";
      
      try {
        // Check if it's a Firestore JSON error
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes("Missing or insufficient permissions")) {
            errorMessage = "আপনার এই তথ্যটি দেখার অনুমতি নেই। দয়া করে সঠিক অ্যাকাউন্ট দিয়ে লগইন করুন।";
          }
        }
      } catch (e) {
        // Not a JSON error, use default
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full border-red-100 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">সমস্যা হয়েছে</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-600 leading-relaxed">
                {errorMessage}
              </p>
              <div className="pt-4">
                <Button 
                  onClick={this.handleReset}
                  className="bg-[#2d5a27] hover:bg-[#1a3a3a] text-white px-8 py-6 rounded-full text-lg font-bold w-full transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  আবার চেষ্টা করুন
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-40">
                  <pre className="text-xs text-gray-700">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
