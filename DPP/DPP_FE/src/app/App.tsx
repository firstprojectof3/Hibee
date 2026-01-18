// Main App component
import React from 'react';
import { AppProviders } from "./providers/AppProviders";
import { AppBootstrap } from "./bootstrap/AppBootstrap";

export default function App() {
    return (
        <AppProviders>
            <AppBootstrap />
        </AppProviders>
    );
}