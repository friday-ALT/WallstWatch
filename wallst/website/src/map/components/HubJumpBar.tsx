import { MAP_HUBS, MapHub } from '../utils/clusters';

interface Props {
  activeHubId: string | null;
  onJump: (hub: MapHub | null) => void;
}

export function HubJumpBar({ activeHubId, onJump }: Props) {
  return (
    <div className="mm-hub-bar">
      <span className="mm-hub-label">ZOOM HUB</span>
      {MAP_HUBS.map(h => (
        <button
          key={h.id}
          type="button"
          className={`mm-hub-btn${activeHubId === h.id ? ' active' : ''}`}
          onClick={() => onJump(activeHubId === h.id ? null : h)}
        >
          {h.label.toUpperCase()}
        </button>
      ))}
      {activeHubId && (
        <button type="button" className="mm-hub-btn reset" onClick={() => onJump(null)}>
          WORLD VIEW
        </button>
      )}
    </div>
  );
}
