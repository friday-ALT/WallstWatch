import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { shouldConfirmLeave } from './workspace';

interface LeaveCtx {
  /** Navigate away from workspace — prompts if leaving terminal/map */
  leaveTo: (path: string) => void;
  /** Navigate within workspace — never prompts */
  goWorkspace: (path: string) => void;
}

const Ctx = createContext<LeaveCtx | null>(null);

export function LeaveTerminalProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pending, setPending] = useState<string | null>(null);

  const goWorkspace = useCallback(
    (path: string) => navigate(path),
    [navigate]
  );

  const leaveTo = useCallback(
    (path: string) => {
      if (shouldConfirmLeave(pathname, path)) {
        setPending(path);
      } else {
        navigate(path);
      }
    },
    [navigate, pathname]
  );

  const confirmLeave = () => {
    if (pending) navigate(pending);
    setPending(null);
  };

  const cancelLeave = () => setPending(null);

  return (
    <Ctx.Provider value={{ leaveTo, goWorkspace }}>
      {children}
      {pending &&
        createPortal(
          <div className="leave-terminal-overlay" onClick={cancelLeave} role="presentation">
            <div
              className="leave-terminal-modal"
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-labelledby="leave-terminal-title"
              aria-modal="true"
            >
              <div className="leave-terminal-icon">◆</div>
              <p className="leave-terminal-kicker">WALLST WATCH WORKSPACE</p>
              <h2 id="leave-terminal-title" className="leave-terminal-title">
                Leave the terminal?
              </h2>
              <p className="leave-terminal-body">
                Market Map, Command Center, equity research, and live quotes all live in one workspace.
                Going back to the marketing site closes your current terminal session view.
              </p>
              <div className="leave-terminal-actions">
                <button type="button" className="leave-terminal-stay" onClick={cancelLeave}>
                  Stay in terminal
                </button>
                <button type="button" className="leave-terminal-go" onClick={confirmLeave}>
                  Leave anyway →
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </Ctx.Provider>
  );
}

export function useLeaveTerminal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLeaveTerminal requires LeaveTerminalProvider');
  return ctx;
}
