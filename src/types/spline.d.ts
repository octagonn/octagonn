
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': {
        url?: string;
        style?: React.CSSProperties;
        className?: string;
      };
    }
  }
}

export {};
