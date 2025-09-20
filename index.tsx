/**
 * @en This is the main entry point for the React application.
 *     It renders the root `App` component into the DOM.
 * @de Dies ist der Haupteinstiegspunkt für die React-Anwendung.
 *     Er rendert die Wurzelkomponente `App` in das DOM.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to / Root-Element zum Mounten nicht gefunden");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
