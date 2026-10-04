import { useRef, useState } from 'react';
import { api, resolveImage } from '../../lib/api.js';
import { useToast } from './Toast.jsx';

// Upload widget: uploads via /api/upload (Sharp -> WebP) and returns the stored URL.
// Also allows pasting an external image URL.
export default function ImagePicker({ value, onChange, label = 'Image', placement }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const notify = useToast();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload(file, placement ? { placement } : {});
      onChange(res.url);
      notify('Image uploaded');
    } catch (err) {
      notify(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div className="imgpick">
        {value ? (
          <img className="imgpick__preview" src={resolveImage(value)} alt="preview" />
        ) : (
          <div className="imgpick__preview imgpick__preview--empty">No image</div>
        )}
        <div className="imgpick__controls">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="abtn abtn--ghost abtn--sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button type="button" className="abtn abtn--danger abtn--sm" onClick={() => onChange('')}>
              Remove
            </button>
          )}
          <input
            type="text"
            placeholder="or paste image URL"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="imgpick__hint">Auto-optimized to WebP, max 1920px.</span>
        </div>
      </div>
    </div>
  );
}
