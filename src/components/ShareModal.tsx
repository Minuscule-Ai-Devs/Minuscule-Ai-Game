import { useEffect, useState } from 'react';
import { Check, Copy, Download, Share2, X } from 'lucide-react';
import type { SharePayload } from '../types/game.ts';
import { generateShareCardDataUrl } from '../lib/shareCard.ts';

interface ShareModalProps {
  payload: SharePayload | null;
  playerName: string;
  onClose: () => void;
}

export function ShareModal({ payload, playerName, onClose }: ShareModalProps) {
  const [cardUrl, setCardUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!payload) return;
    let active = true;
    setCopied(false);
    generateShareCardDataUrl(payload, playerName).then((url) => {
      if (active) setCardUrl(url);
    });
    return () => {
      active = false;
    };
  }, [payload, playerName]);

  if (!payload) return null;

  const shareText = `${payload.summaryText}\n${typeof window !== 'undefined' ? window.location.origin : ''}`;
  const encodedText = encodeURIComponent(payload.summaryText);
  const encodedUrl = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : 'https://minuscule.app'
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function handleNativeShare() {
    if (!payload) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.summaryText,
          url: window.location.href,
        });
      } catch {
        // User canceled share dialog
      }
    }
  }

  const socialLinks = [
    {
      name: 'Post on X',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: 'Share on Reddit',
      href: `https://www.reddit.com/submit?title=${encodeURIComponent(payload.title)}&text=${encodedText}`,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share your result"
    >
      <div
        className="w-full max-w-xl rounded-2xl border p-6 shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">{payload.title}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Share your score, rank, or daily clear directly
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="rounded-lg p-2 cursor-pointer transition-opacity hover:opacity-75"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cardUrl && (
          <div
            className="mt-4 overflow-hidden rounded-xl border"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <img src={cardUrl} alt="Shareable result card" className="w-full h-auto block" />
          </div>
        )}

        <pre
          className="mt-4 whitespace-pre-wrap rounded-xl border p-3.5 font-mono text-xs leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-primary)',
          }}
        >
          {payload.summaryText}
        </pre>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)',
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied Scorecard' : 'Copy Scorecard'}</span>
          </button>

          {cardUrl && (
            <a
              href={cardUrl}
              download={`minuscule-${Date.now()}.png`}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
              style={{
                borderColor: 'var(--border-hairline)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
              }}
            >
              <Download className="h-4 w-4" />
              <span>Save Card PNG</span>
            </a>
          )}

          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold cursor-pointer"
              style={{
                borderColor: 'var(--border-hairline)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
              }}
            >
              <Share2 className="h-4 w-4" />
              <span>Device Share</span>
            </button>
          )}
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-xs"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Share directly:</span>
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
