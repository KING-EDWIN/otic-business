import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal = ({ isOpen, onClose, videoUrl }: VideoModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#040458]">
          <h3 className="text-xl font-bold text-white">Otic Vision Demo</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://youtu.be/TjCnA74F0gE', '_blank')}
              className="text-white hover:text-[#faa51a] hover:bg-white/10"
            >
              Open in YouTube
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:text-[#faa51a] hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black">
          <div className="aspect-video w-full">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Otic Vision Demo Video"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-300">
              Watch how Otic Vision transforms your SME operations
            </p>
            <Button
              onClick={onClose}
              className="bg-[#faa51a] hover:bg-[#040458] text-white"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
