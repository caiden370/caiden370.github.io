import { useState, useEffect } from 'react';
import { Share, Plus, Smartphone, X } from 'lucide-react';

const STORAGE_KEY = 'homescreen-prompt-dismissed';

function HomeScreenInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="homescreen-prompt-overlay" onClick={handleOverlayClick}>
      <div className="homescreen-prompt-card">
        <button className="homescreen-prompt-close" onClick={handleClose}>
          <X size={20} />
        </button>
        
        <h2 className="homescreen-prompt-title">Add to Homescreen</h2>
        <p className="homescreen-prompt-subtitle">Use Masblo as an app on your device</p>
        
        <div className="homescreen-prompt-steps">
          <div className="homescreen-prompt-step">
            <div className="homescreen-prompt-step-number">1</div>
            <div className="homescreen-prompt-step-content">
              <Smartphone size={24} className="homescreen-prompt-icon" />
              <span>Open <strong>masblo.com</strong> in Safari</span>
            </div>
          </div>
          
          <div className="homescreen-prompt-step">
            <div className="homescreen-prompt-step-number">2</div>
            <div className="homescreen-prompt-step-content">
              <Share size={24} className="homescreen-prompt-icon" />
              <span>Tap the <strong>Share</strong> icon</span>
            </div>
          </div>
          
          <div className="homescreen-prompt-step">
            <div className="homescreen-prompt-step-number">3</div>
            <div className="homescreen-prompt-step-content">
              <Plus size={24} className="homescreen-prompt-icon" />
              <span>Tap <strong>Save to Homescreen</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreenInstallPrompt;
