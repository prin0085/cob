import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, resolveImage } from '../../lib/api.js';
import { Loading, ErrorState } from '../../components/common/States.jsx';
import ImagePicker from '../components/ImagePicker.jsx';
import { useToast } from '../components/Toast.jsx';

const empty = {
  name: '', slug: '', category: '', description: '', alcohol: '', volume: '',
  country: '', region: '', vintage: '', aroma: '', taste: '', finish: '',
  food_pairing: '', main_image: '', status: 1, featured: 0, sort_order: 0, gallery: [],
  // Optional Thai translations (fall back to the above when blank)
  name_th: '', category_th: '', description_th: '', country_th: '', region_th: '',
  vintage_th: '', aroma_th: '', taste_th: '', finish_th: '', food_pairing_th: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/products/${id}`, true)
      .then((p) => {
        setForm({ ...empty, ...p, gallery: (p.gallery || []).map((g) => g.url) });
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id, editing]);

  const set = (key) => (e) => {
    const val = e && e.target ? (e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const addGalleryImage = (url) => {
    if (url) setForm((f) => ({ ...f, gallery: [...f.gallery, url] }));
  };
  const removeGalleryImage = (i) => {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, idx) => idx !== i) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/products/${id}`, form, true);
      else await api.post('/products', form, true);
      notify(editing ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  return (
    <form onSubmit={submit}>
      <div className="admin__topbar">
        <h1>{editing ? 'Edit Product' : 'Add Product'}</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="abtn abtn--ghost" onClick={() => navigate('/admin/products')}>Cancel</button>
          <button type="submit" className="abtn" disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
        </div>
      </div>

      <div className="apanel">
        <div className="apanel__title">Basics</div>
        <div className="field">
          <label>Product Name</label>
          <input value={form.name} onChange={set('name')} required />
        </div>
        <div className="field__row">
          <div className="field">
            <label>Slug (optional)</label>
            <input value={form.slug} onChange={set('slug')} placeholder="auto-generated from name" />
          </div>
          <div className="field">
            <label>Category</label>
            <input value={form.category} onChange={set('category')} />
          </div>
        </div>
        <div className="field">
          <label>Short Description</label>
          <textarea value={form.description} onChange={set('description')} />
        </div>
      </div>

      <div className="apanel">
        <div className="apanel__title">Specifications</div>
        <div className="field__row">
          <div className="field"><label>Alcohol %</label><input value={form.alcohol} onChange={set('alcohol')} /></div>
          <div className="field"><label>Volume</label><input value={form.volume} onChange={set('volume')} /></div>
        </div>
        <div className="field__row">
          <div className="field"><label>Country</label><input value={form.country} onChange={set('country')} /></div>
          <div className="field"><label>Region</label><input value={form.region} onChange={set('region')} /></div>
        </div>
        <div className="field"><label>Vintage / Year / Type</label><input value={form.vintage} onChange={set('vintage')} /></div>
      </div>

      <div className="apanel">
        <div className="apanel__title">Tasting Notes</div>
        <div className="field"><label>Aroma</label><input value={form.aroma} onChange={set('aroma')} /></div>
        <div className="field"><label>Taste</label><input value={form.taste} onChange={set('taste')} /></div>
        <div className="field"><label>Finish</label><input value={form.finish} onChange={set('finish')} /></div>
        <div className="field"><label>Food Pairing</label><input value={form.food_pairing} onChange={set('food_pairing')} /></div>
      </div>

      <div className="apanel">
        <div className="apanel__title">Images</div>
        <ImagePicker label="Main Image" value={form.main_image} onChange={set('main_image')} placement="product" />

        <label style={{ fontSize: '0.74rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,239,230,0.66)', marginBottom: 10, display: 'block' }}>
          Gallery Images
        </label>
        <div className="imgpick" style={{ marginBottom: 14 }}>
          {form.gallery.map((url, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img className="imgpick__preview" src={resolveImage(url)} alt="" />
              <button
                type="button"
                className="abtn abtn--danger abtn--sm"
                style={{ position: 'absolute', top: 4, right: 4, padding: '2px 8px' }}
                onClick={() => removeGalleryImage(i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <ImagePicker label="Add Gallery Image" value="" onChange={addGalleryImage} placement="product-gallery" />
      </div>

      <div className="apanel">
        <div className="apanel__title">Thai Translation (optional)</div>
        <p style={{ fontSize: '0.8rem', color: 'rgba(244,239,230,0.5)', marginTop: -8, marginBottom: 16 }}>
          Leave any field blank to fall back to the English version when the site is viewed in Thai.
        </p>
        <div className="field"><label>ชื่อสินค้า (Name)</label><input value={form.name_th} onChange={set('name_th')} /></div>
        <div className="field"><label>หมวดหมู่ (Category)</label><input value={form.category_th} onChange={set('category_th')} /></div>
        <div className="field"><label>คำอธิบาย (Description)</label><textarea value={form.description_th} onChange={set('description_th')} /></div>
        <div className="field__row">
          <div className="field"><label>ประเทศ (Country)</label><input value={form.country_th} onChange={set('country_th')} /></div>
          <div className="field"><label>ภูมิภาค (Region)</label><input value={form.region_th} onChange={set('region_th')} /></div>
        </div>
        <div className="field"><label>ปี / ประเภท (Vintage)</label><input value={form.vintage_th} onChange={set('vintage_th')} /></div>
        <div className="field"><label>กลิ่น (Aroma)</label><input value={form.aroma_th} onChange={set('aroma_th')} /></div>
        <div className="field"><label>รสชาติ (Taste)</label><input value={form.taste_th} onChange={set('taste_th')} /></div>
        <div className="field"><label>ปลายรส (Finish)</label><input value={form.finish_th} onChange={set('finish_th')} /></div>
        <div className="field"><label>อาหารที่เข้ากัน (Food Pairing)</label><input value={form.food_pairing_th} onChange={set('food_pairing_th')} /></div>
      </div>

      <div className="apanel">
        <div className="apanel__title">Publishing</div>
        <div className="field field--check">
          <input type="checkbox" id="status" checked={!!form.status} onChange={set('status')} />
          <label htmlFor="status">Published (visible on site)</label>
        </div>
        <div className="field field--check">
          <input type="checkbox" id="featured" checked={!!form.featured} onChange={set('featured')} />
          <label htmlFor="featured">Featured (show in slideshow)</label>
        </div>
        <div className="field" style={{ maxWidth: 200 }}>
          <label>Sort Order</label>
          <input type="number" value={form.sort_order} onChange={set('sort_order')} />
        </div>
      </div>
    </form>
  );
}
