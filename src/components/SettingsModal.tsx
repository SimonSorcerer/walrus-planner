import { useEffect, useRef } from 'react';
import type { ActivityColors } from '../hooks/useSettings';
import { ACTIVITIES, ACTIVITY_TYPES, PALETTE, type ActivityType } from '../types';

interface Props {
  open: boolean;
  colors: ActivityColors;
  onSetColor: (type: ActivityType, color: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export function SettingsModal({ open, colors, onSetColor, onReset, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="settings"
      aria-label="Settings"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // backdrop click
      }}
    >
      <div className="settings__body">
        <div className="settings__head">
          <h2 className="settings__title">Activity colors</h2>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        {ACTIVITY_TYPES.map((type) => (
          <div key={type} className="settings__row">
            <span className="settings__icon" aria-hidden="true" style={{ color: colors[type] }}>
              {ACTIVITIES[type].icon}
            </span>
            <span className="settings__label">{ACTIVITIES[type].label}</span>
            <div
              className="settings__swatches"
              role="radiogroup"
              aria-label={`${ACTIVITIES[type].label} color`}
            >
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={colors[type] === color}
                  aria-label={color}
                  title={color}
                  className={colors[type] === color ? 'swatch swatch--active' : 'swatch'}
                  style={{ background: color }}
                  onClick={() => onSetColor(type, color)}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="settings__foot">
          <button type="button" className="btn" onClick={onReset}>
            Reset to defaults
          </button>
        </div>
      </div>
    </dialog>
  );
}
