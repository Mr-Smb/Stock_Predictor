import * as React from "react";
import { COLORS } from "../../core/config/constants";

interface Props {
  children: React.ReactNode;
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
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: "100vh", 
          background: COLORS.BG, 
          color: COLORS.TEXT, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          padding: 20,
          textAlign: "center",
          fontFamily: "monospace"
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h1 style={{ color: COLORS.RED, marginBottom: 10 }}>Application Error</h1>
          <p style={{ color: COLORS.MUTED, maxWidth: 500, marginBottom: 24 }}>
            The application encountered an unexpected error. We've logged the issue and are working on it.
          </p>
          <div style={{ 
            background: COLORS.SURFACE, 
            padding: 16, 
            borderRadius: 8, 
            border: `1px solid ${COLORS.RED}33`,
            fontSize: 12,
            marginBottom: 24,
            maxWidth: "100%",
            overflowX: "auto"
          }}>
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: COLORS.ACCENT,
              color: "#000",
              border: "none",
              padding: "10px 24px",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
