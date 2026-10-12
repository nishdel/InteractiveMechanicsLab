import { Component, createRef, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
export class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  private host = createRef<HTMLDivElement>();
  private contextLost = (event: Event) => {
    event.preventDefault();
    this.setState({ failed: true });
  };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidMount() {
    this.host.current?.addEventListener('webglcontextlost', this.contextLost, true);
  }
  componentWillUnmount() {
    this.host.current?.removeEventListener('webglcontextlost', this.contextLost, true);
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep a useful local diagnostic without sending telemetry.
    console.warn('3D view unavailable', error.message, info.componentStack);
  }
  render() {
    return (
      <div className="scene-boundary" ref={this.host}>
        {this.state.failed ? (
          <div className="empty-state" role="status">
            <h3>3D view unavailable</h3>
            <p>
              The 3D renderer could not start or continue. Calculations, learning activities, and
              failure analysis still work.
            </p>
            <button onClick={() => this.setState({ failed: false })}>Retry 3D view</button>
          </div>
        ) : (
          this.props.children
        )}
      </div>
    );
  }
}
