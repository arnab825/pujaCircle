import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ChevronDown, Copy, Check, MessageSquare } from 'lucide-react';
import { PujaCircleLogo } from '@/components/common/PujaCircleLogo';
import { logAppError } from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    logAppError('ReactErrorBoundary', error, { componentStack: errorInfo.componentStack });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  private handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const text = `PujaCircle Error Log\n--------------------\nTime: ${new Date().toISOString()}\nMessage: ${error?.message || 'Unknown Error'}\nStack: ${error?.stack || 'No Stack'}\nComponent Stack: ${errorInfo?.componentStack || 'No Component Stack'}`;
    navigator.clipboard.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      const { error, showDetails, copied } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 select-text">
          <div className="max-w-lg w-full text-center space-y-6 p-6 sm:p-8 bg-card rounded-lg border border-border shadow-md">
            {/* Brand Logo & Error Status Header */}
            <div className="flex flex-col items-center gap-3">
              <PujaCircleLogo size={48} className="shadow-xs" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" /> Application Notice
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-serif text-foreground">
                We encountered an unexpected error
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                An unexpected display issue interrupted your session. Our logging system has captured this occurrence and our team is actively monitoring system health.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <Button
                size="sm"
                onClick={this.handleReload}
                className="w-full gap-2 text-xs font-semibold h-9 shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reload Application
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="w-full gap-2 text-xs h-9"
              >
                <Home className="h-3.5 w-3.5" /> Return Home
              </Button>
            </div>

            {/* Support Link */}
            <div className="pt-1 text-center">
              <a
                href="/contact"
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <MessageSquare className="h-3 w-3" /> Need immediate assistance? Contact Support
              </a>
            </div>

            {/* Expandable Technical Debug Details */}
            <div className="border-t border-border/80 pt-4 text-left">
              <button
                type="button"
                onClick={this.toggleDetails}
                className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground font-medium transition-colors py-1"
              >
                <span>Technical diagnostics</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
              </button>

              {showDetails && (
                <div className="mt-3 p-3 rounded-md bg-muted/60 border border-border/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                      {error?.name || 'Error'}: {error?.message || 'Unknown Exception'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={this.handleCopyError}
                      className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  {error?.stack && (
                    <pre className="text-[10px] font-mono text-muted-foreground/80 overflow-x-auto max-h-36 p-2 rounded bg-background/50 border border-border/40 whitespace-pre-wrap leading-tight">
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
