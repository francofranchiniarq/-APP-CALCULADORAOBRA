import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'
import { restoreFromServer, patchLocalStorage } from './services/storageSync.js'

async function init() {
  // 1. Interceptar localStorage.setItem para auto-backup (fire-and-forget)
  patchLocalStorage();

  // 2. Restaurar datos del servidor antes del primer render.
  //    Si localStorage ya tiene datos, esta llamada no los pisa.
  await restoreFromServer();

  // 3. Montar la app — ahora con los datos ya disponibles en localStorage
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

init();
