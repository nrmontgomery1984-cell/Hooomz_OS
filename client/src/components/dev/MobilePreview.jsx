import { useState, useEffect } from 'react';
import { Smartphone, Monitor, X, RotateCcw } from 'lucide-react';

// Common device presets
const DEVICE_PRESETS = {
  'iphone-14': { name: 'iPhone 14', width: 390, height: 844 },
  'iphone-se': { name: 'iPhone SE', width: 375, height: 667 },
  'iphone-14-pro-max': { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  'pixel-7': { name: 'Pixel 7', width: 412, height: 915 },
  'samsung-s23': { name: 'Samsung S23', width: 360, height: 780 },
  'ipad-mini': { name: 'iPad Mini', width: 768, height: 1024 },
};

/**
 * MobilePreviewToggle - Floating button to toggle mobile preview mode
 */
export function MobilePreviewToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(() => {
    return localStorage.getItem('hooomz-preview-mode') || 'desktop';
  });
  const [device, setDevice] = useState(() => {
    return localStorage.getItem('hooomz-preview-device') || 'iphone-14';
  });

  useEffect(() => {
    localStorage.setItem('hooomz-preview-mode', previewMode);
    localStorage.setItem('hooomz-preview-device', device);

    // Dispatch custom event for the wrapper to listen to
    window.dispatchEvent(new CustomEvent('preview-mode-change', {
      detail: { mode: previewMode, device }
    }));
  }, [previewMode, device]);

  const currentDevice = DEVICE_PRESETS[device];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-[100] w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        title="Device Preview"
      >
        {previewMode === 'mobile' ? (
          <Smartphone className="w-5 h-5" />
        ) : (
          <Monitor className="w-5 h-5" />
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-[100] w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-purple-900">Device Preview</span>
            <button onClick={() => setIsOpen(false)} className="text-purple-600 hover:text-purple-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  previewMode === 'desktop'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  previewMode === 'mobile'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </button>
            </div>

            {/* Device Selector (only in mobile mode) */}
            {previewMode === 'mobile' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Device</label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(DEVICE_PRESETS).map(([key, { name, width, height }]) => (
                    <option key={key} value={key}>
                      {name} ({width}x{height})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Device Info */}
            {previewMode === 'mobile' && currentDevice && (
              <div className="text-xs text-gray-500 text-center">
                {currentDevice.width} x {currentDevice.height}px
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={() => {
                setPreviewMode('desktop');
                setDevice('iphone-14');
              }}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Desktop
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * MobilePreviewWrapper - Wraps app content in a mobile frame when preview mode is active
 */
export function MobilePreviewWrapper({ children }) {
  const [previewMode, setPreviewMode] = useState(() => {
    return localStorage.getItem('hooomz-preview-mode') || 'desktop';
  });
  const [device, setDevice] = useState(() => {
    return localStorage.getItem('hooomz-preview-device') || 'iphone-14';
  });

  useEffect(() => {
    const handleChange = (e) => {
      setPreviewMode(e.detail.mode);
      setDevice(e.detail.device);
    };
    window.addEventListener('preview-mode-change', handleChange);
    return () => window.removeEventListener('preview-mode-change', handleChange);
  }, []);

  if (previewMode !== 'mobile') {
    return children;
  }

  const deviceConfig = DEVICE_PRESETS[device] || DEVICE_PRESETS['iphone-14'];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      {/* Device Frame */}
      <div
        className="relative bg-black rounded-[40px] p-3 shadow-2xl"
        style={{
          width: deviceConfig.width + 24,
          height: deviceConfig.height + 24
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10" />

        {/* Screen */}
        <div
          className="bg-white rounded-[32px] overflow-hidden relative"
          style={{
            width: deviceConfig.width,
            height: deviceConfig.height
          }}
        >
          <div className="w-full h-full overflow-auto">
            {children}
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
      </div>

      {/* Device Label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {deviceConfig.name} Preview
      </div>
    </div>
  );
}

export default MobilePreviewToggle;
