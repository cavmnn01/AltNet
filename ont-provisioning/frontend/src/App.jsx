import { useState } from 'react';
import { session } from './api.js';
import Login from './components/Login.jsx';
import ScanView from './components/ScanView.jsx';
import ValidationView from './components/ValidationView.jsx';

export default function App() {
  const [auth, setAuth] = useState(session.get());
  const [scanned, setScanned] = useState(null); // { vendor, serial }

  if (!auth) return <main><Login onLogin={setAuth} /></main>;

  return (
    <main>
      <header>
        <span>{auth.technician.name}</span>
        <button className="link" onClick={() => { session.clear(); setAuth(null); setScanned(null); }}>Salir</button>
      </header>
      {scanned ? (
        <ValidationView serial={scanned.serial} onDone={() => setScanned(null)} onCancel={() => setScanned(null)} />
      ) : (
        <ScanView onSerial={setScanned} />
      )}
    </main>
  );
}
