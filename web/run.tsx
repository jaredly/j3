import './poly';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
import ubahn from 'react-ubahn/runtime';
import { RichText } from './old/Markdown';
import { ByHand } from './custom/ByHand';

ubahn.disable();

declare global {
    var root: Root;
}

window.root =
    window.root ||
    createRoot(
        (() => {
            const node = document.createElement('div');
            document.body.append(node);
            return node;
        })(),
    );

class ErrorBoundary extends React.Component<
    { children: any },
    { hasError: Error | null }
> {
    state = { hasError: null };

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ margin: 32 }}>
                    <h1>Something went wrong.</h1>
                    {'' + this.state.hasError}
                </div>
            );
        }
        return this.props.children;
    }
}

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <ByHand />
        </ErrorBoundary>
    </React.StrictMode>,
);
