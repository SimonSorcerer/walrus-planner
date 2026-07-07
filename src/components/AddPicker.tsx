import { ACTIVITIES, ACTIVITY_TYPES, type ActivityType } from '../types';

interface Props {
  onPick: (type: ActivityType) => void;
  onClose: () => void;
}

export function AddPicker({ onPick, onClose }: Props) {
  return (
    <div className="add-picker" onClick={(e) => e.stopPropagation()}>
      {ACTIVITY_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          className="add-picker__option"
          data-type={type}
          title={`Add ${ACTIVITIES[type].label}`}
          aria-label={`Add ${ACTIVITIES[type].label}`}
          onClick={() => {
            onPick(type);
            onClose();
          }}
        >
          <span className="msym" aria-hidden="true">
            {ACTIVITIES[type].icon}
          </span>
        </button>
      ))}
    </div>
  );
}
