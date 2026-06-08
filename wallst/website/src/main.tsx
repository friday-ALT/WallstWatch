import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './auth/ThemeContext';
import { TerminalProvider } from './terminal/TerminalProvider';
import { LeaveTerminalProvider } from './terminal/LeaveTerminalContext';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LeaveTerminalProvider>
        <ThemeProvider>
          <AuthProvider>
            <TerminalProvider>
              <App />
            </TerminalProvider>
          </AuthProvider>
        </ThemeProvider>
      </LeaveTerminalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
