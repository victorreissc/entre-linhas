import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { DadosProvider } from './hooks/DadosContexto.jsx';
import '../styles/base.css';
import './apresentacao.css';

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <DadosProvider>
      <App />
    </DadosProvider>
  </StrictMode>,
);
