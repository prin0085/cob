import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { Loading, ErrorState } from '../../components/common/States.jsx';
import ImagePicker from '../components/ImagePicker.jsx';
import { useToast } from '../components/Toast.jsx';

// Editable homepage sections. Each section is a JSON blob keyed on the backend.
export default function Homepage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const notify = useToast();

  const load = () => {
    setError(null);
    api.get('/homepage').then((d) => setData(d || {})).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const update = (section, key, value) =>
    setData((d) => ({ ...d, [section]: { ...(d[section] || {}), [key]: value } }));

  const updateFeature = (i, key, value) =>
    setData((d) => {
      const features = [...(d.philosophy?.features || [])];
      features[i] = { ...features[i], [key]: value };
      return { ...d, philosophy: { ...d.philosophy, features } };
    });

  const save = async (section) => {
    setSavingKey(section);
    try {
      await api.put(`/homepage/${section}`, data[section] || {}, true);
      notify('Section saved');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setSavingKey(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Loading />;

  const hero = data.hero || {};
  const story = data.story || {};
  const philosophy = data.philosophy || {};
  const cta = data.cta || {};

  const SaveBtn = ({ section }) => (
    <button className="abtn abtn--sm" onClick={() => save(section)} disabled={savingKey === section}>
      {savingKey === section ? 'Saving…' : 'Save Section'}
    </button>
  );

  return (
    <>
      <div className="admin__topbar"><h1>Homepage Content</h1></div>

      {/* HERO */}
      <div className="apanel">
        <div className="apanel__title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Hero</span><SaveBtn section="hero" />
        </div>
        <div className="field"><label>Logo Text</label><input value={hero.logo || ''} onChange={(e) => update('hero', 'logo', e.target.value)} /></div>
        <div className="field"><label>Heading</label><input value={hero.heading || ''} onChange={(e) => update('hero', 'heading', e.target.value)} /></div>
        <div className="field"><label>Heading (ไทย)</label><input value={hero.heading_th || ''} onChange={(e) => update('hero', 'heading_th', e.target.value)} /></div>
        <div className="field"><label>Description</label><textarea value={hero.description || ''} onChange={(e) => update('hero', 'description', e.target.value)} /></div>
        <div className="field"><label>Description (ไทย)</label><textarea value={hero.description_th || ''} onChange={(e) => update('hero', 'description_th', e.target.value)} /></div>
        <div className="field__row">
          <div className="field"><label>Button Text</label><input value={hero.buttonText || ''} onChange={(e) => update('hero', 'buttonText', e.target.value)} /></div>
          <div className="field"><label>Button Text (ไทย)</label><input value={hero.buttonText_th || ''} onChange={(e) => update('hero', 'buttonText_th', e.target.value)} /></div>
        </div>
        <div className="field"><label>Button Link</label><input value={hero.buttonLink || ''} onChange={(e) => update('hero', 'buttonLink', e.target.value)} /></div>
        <ImagePicker label="Background Image" value={hero.backgroundImage} onChange={(v) => update('hero', 'backgroundImage', v)} placement="hero" />
      </div>

      {/* STORY */}
      <div className="apanel">
        <div className="apanel__title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Our Story</span><SaveBtn section="story" />
        </div>
        <div className="field"><label>Heading</label><input value={story.heading || ''} onChange={(e) => update('story', 'heading', e.target.value)} /></div>
        <div className="field"><label>Heading (ไทย)</label><input value={story.heading_th || ''} onChange={(e) => update('story', 'heading_th', e.target.value)} /></div>
        <div className="field"><label>Description</label><textarea value={story.description || ''} onChange={(e) => update('story', 'description', e.target.value)} style={{ minHeight: 140 }} /></div>
        <div className="field"><label>Description (ไทย)</label><textarea value={story.description_th || ''} onChange={(e) => update('story', 'description_th', e.target.value)} style={{ minHeight: 140 }} /></div>
        <ImagePicker label="Story Image" value={story.image} onChange={(v) => update('story', 'image', v)} placement="story" />
      </div>

      {/* PHILOSOPHY */}
      <div className="apanel">
        <div className="apanel__title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Philosophy</span><SaveBtn section="philosophy" />
        </div>
        <div className="field"><label>Heading</label><input value={philosophy.heading || ''} onChange={(e) => update('philosophy', 'heading', e.target.value)} /></div>
        <div className="field"><label>Heading (ไทย)</label><input value={philosophy.heading_th || ''} onChange={(e) => update('philosophy', 'heading_th', e.target.value)} /></div>
        <div className="field"><label>Description</label><textarea value={philosophy.description || ''} onChange={(e) => update('philosophy', 'description', e.target.value)} /></div>
        <div className="field"><label>Description (ไทย)</label><textarea value={philosophy.description_th || ''} onChange={(e) => update('philosophy', 'description_th', e.target.value)} /></div>
        {(philosophy.features || []).map((f, i) => (
          <div key={i} style={{ borderTop: '1px solid rgba(244,239,230,0.08)', paddingTop: 14 }}>
            <div className="field__row">
              <div className="field"><label>Icon (leaf/hammer/award/heritage)</label><input value={f.icon || ''} onChange={(e) => updateFeature(i, 'icon', e.target.value)} /></div>
              <div className="field"><label>Title</label><input value={f.title || ''} onChange={(e) => updateFeature(i, 'title', e.target.value)} /></div>
            </div>
            <div className="field__row">
              <div className="field"><label>Title (ไทย)</label><input value={f.title_th || ''} onChange={(e) => updateFeature(i, 'title_th', e.target.value)} /></div>
              <div className="field"><label>Description</label><input value={f.description || ''} onChange={(e) => updateFeature(i, 'description', e.target.value)} /></div>
            </div>
            <div className="field"><label>Description (ไทย)</label><input value={f.description_th || ''} onChange={(e) => updateFeature(i, 'description_th', e.target.value)} /></div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="apanel">
        <div className="apanel__title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Call To Action</span><SaveBtn section="cta" />
        </div>
        <div className="field"><label>Heading</label><input value={cta.heading || ''} onChange={(e) => update('cta', 'heading', e.target.value)} /></div>
        <div className="field"><label>Heading (ไทย)</label><input value={cta.heading_th || ''} onChange={(e) => update('cta', 'heading_th', e.target.value)} /></div>
        <div className="field"><label>Description</label><textarea value={cta.description || ''} onChange={(e) => update('cta', 'description', e.target.value)} /></div>
        <div className="field"><label>Description (ไทย)</label><textarea value={cta.description_th || ''} onChange={(e) => update('cta', 'description_th', e.target.value)} /></div>
        <div className="field__row">
          <div className="field"><label>Button Text</label><input value={cta.buttonText || ''} onChange={(e) => update('cta', 'buttonText', e.target.value)} /></div>
          <div className="field"><label>Button Text (ไทย)</label><input value={cta.buttonText_th || ''} onChange={(e) => update('cta', 'buttonText_th', e.target.value)} /></div>
        </div>
        <div className="field"><label>Button Link</label><input value={cta.buttonLink || ''} onChange={(e) => update('cta', 'buttonLink', e.target.value)} /></div>
        <ImagePicker label="Background Image" value={cta.backgroundImage} onChange={(v) => update('cta', 'backgroundImage', v)} placement="cta" />
      </div>
    </>
  );
}
