import { useState } from 'react';
import { Camera, Download, X } from 'lucide-react';

interface Screenshot {
  id: string;
  dataUrl: string;
  timestamp: string;
  userId: string;
  userName: string;
}

interface ScreenshotCaptureProps {
  userId: string;
  userName: string;
}

export default function ScreenshotCapture({ userId, userName }: ScreenshotCaptureProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>(() => {
    const saved = localStorage.getItem('screenshots');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/png');
        const screenshot: Screenshot = {
          id: Date.now().toString(),
          dataUrl,
          timestamp: new Date().toISOString(),
          userId,
          userName
        };
        
        const updated = [...screenshots, screenshot];
        setScreenshots(updated);
        localStorage.setItem('screenshots', JSON.stringify(updated));
        
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadScreenshot = (screenshot: Screenshot) => {
    const link = document.createElement('a');
    link.download = `screenshot-${screenshot.id}.png`;
    link.href = screenshot.dataUrl;
    link.click();
  };

  const deleteScreenshot = (id: string) => {
    const updated = screenshots.filter(s => s.id !== id);
    setScreenshots(updated);
    localStorage.setItem('screenshots', JSON.stringify(updated));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Screenshots</h1>
        <button
          onClick={captureScreenshot}
          disabled={isCapturing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <Camera className="w-4 h-4" />
          {isCapturing ? 'Capturing...' : 'Capture Screenshot'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screenshots.map((screenshot) => (
          <div key={screenshot.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <img
              src={screenshot.dataUrl}
              alt="Screenshot"
              className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedScreenshot(screenshot)}
            />
            <div className="text-white/80 text-sm mb-2">
              By: {screenshot.userName}
            </div>
            <div className="text-white/60 text-xs mb-4">
              {new Date(screenshot.timestamp).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadScreenshot(screenshot)}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
              <button
                onClick={() => deleteScreenshot(screenshot.id)}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {screenshots.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No screenshots captured yet</p>
        </div>
      )}

      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedScreenshot.dataUrl}
              alt="Screenshot"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}