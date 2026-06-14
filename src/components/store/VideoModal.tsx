'use client';

import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

function getEmbedUrl(videoUrl: string): string {
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  if (isYouTube) {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  if (isVimeo) {
    const videoId = videoUrl.split('/').pop();
    return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }
  return videoUrl;
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  if (!isOpen) return null;

  const embedUrl = getEmbedUrl(videoUrl);
  const isEmbed = embedUrl !== videoUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">{title || 'Factory & Facility Reel'}</DialogTitle>
        <div className="relative aspect-video w-full">
          {isEmbed && (
            <iframe
              src={embedUrl}
              title={title || 'Factory & Facility Reel'}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {!isEmbed && videoUrl && (
            <video
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              controls
            />
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Close video"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
}