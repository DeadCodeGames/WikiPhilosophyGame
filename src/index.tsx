import React from 'react';
import ReactDOM from 'react-dom/client';
import { default as App } from './app/page.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import './input.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);