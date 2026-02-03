import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { AuthProvider as SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';

// Clean entry point with minimal providers
ReactDOM.createRoot(document.getElementById('root')).render(
  <>
      <BrowserRouter>
        {/* Kept for compatibility if any child strictly requires this context, though it does nothing now */}
        <SupabaseAuthProvider> 
          <App />
        </SupabaseAuthProvider>
      </BrowserRouter>
  </>
);