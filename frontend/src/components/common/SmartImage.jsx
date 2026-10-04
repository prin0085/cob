import { useState } from 'react';
import { resolveImage } from '../../lib/api.js';
import './SmartImage.css';

// Lazy image with fixed aspect ratio to avoid layout shift + fade-in on load.
export default function SmartImage({ src, alt = '', ratio = '4 / 5', className = '', eager = false }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`smart-image ${className}`} style={{ aspectRatio: ratio }}>
      <img
        src={resolveImage(src)}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={loaded ? 'is-loaded' : ''}
      />
    </div>
  );
}
