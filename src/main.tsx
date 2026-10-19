import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
  } catch (err) {
    console.error('Fatal mount error in PromptForge IA:', err);
    rootElement.innerHTML = `
      <div style="padding: 24px; color: #fff; background: #111; font-family: sans-serif;">
        <h2>Erreur de chargement</h2>
        <pre>${String(err)}</pre>
      </div>
    `;
  }
} else {
  console.error('Root element #root not found in document!');
}
