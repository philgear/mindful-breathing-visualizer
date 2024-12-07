import React, { useState } from 'react';

const SettingsModal = ({ onClose }) => {
  const [inhaleDuration, setInhaleDuration] = useState(4);
  const [holdDuration, setHoldDuration] = useState(4);
  const [exhaleDuration, setExhaleDuration] = useState(4);

  const handleSave = () => {
    // Save settings logic here
    onClose();
  };

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <label>
          Inhale Duration:
          <input
            type="number"
            value={inhaleDuration}
            onChange={(e) => setInhaleDuration(parseInt(e.target.value, 10))}
          />
        </label>
      </div>
      <div>
        <label>
          Hold Duration:
          <input
            type="number"
            value={holdDuration}
            onChange={(e) => setHoldDuration(parseInt(e.target.value, 10))}
          />
        </label>
      </div>
      <div>
        <label>
          Exhale Duration:
          <input
            type="number"
            value={exhaleDuration}
            onChange={(e) => setExhaleDuration(parseInt(e.target.value, 10))}
          />
        </label>
      </div>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SettingsModal;
