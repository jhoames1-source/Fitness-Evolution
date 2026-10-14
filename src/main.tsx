import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './app/AppContext';
import { AppLayout } from './app/AppLayout';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento raíz #root no encontrado en el DOM.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProvider>
      <AppLayout />
    </AppProvider>
  </React.StrictMode>
);
