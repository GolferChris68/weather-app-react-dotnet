import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
            Something went wrong
          </p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
            Please reload the page to try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
