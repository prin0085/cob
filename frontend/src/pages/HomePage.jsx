import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Loading, ErrorState } from '../components/common/States.jsx';
import Hero from '../components/sections/Hero.jsx';
import FeaturedSlider from '../components/sections/FeaturedSlider.jsx';
import Story from '../components/sections/Story.jsx';
import Philosophy from '../components/sections/Philosophy.jsx';
import Collection from '../components/sections/Collection.jsx';
import Showcase from '../components/sections/Showcase.jsx';
import CTA from '../components/sections/CTA.jsx';
import Contact from '../components/sections/Contact.jsx';

export default function HomePage() {
  const [state, setState] = useState({ loading: true, error: null });
  const [home, setHome] = useState({});
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [gallery, setGallery] = useState([]);

  const load = () => {
    setState({ loading: true, error: null });
    Promise.all([
      api.get('/homepage'),
      api.get('/products'),
      api.get('/products/featured'),
      api.get('/gallery'),
    ])
      .then(([h, p, f, g]) => {
        setHome(h || {});
        setProducts(p || []);
        setFeatured(f && f.length ? f : (p || []).slice(0, 3));
        setGallery(g || []);
        setState({ loading: false, error: null });
      })
      .catch((err) => setState({ loading: false, error: err.message }));
  };

  useEffect(load, []);

  if (state.loading) return <div style={{ paddingTop: 120 }}><Loading label="Loading" /></div>;
  if (state.error)
    return <div style={{ paddingTop: 120 }}><ErrorState message={state.error} onRetry={load} /></div>;

  return (
    <>
      <Hero data={home.hero} />
      <FeaturedSlider products={featured} />
      <Story data={home.story} />
      <Philosophy data={home.philosophy} />
      <Collection products={products} />
      <Showcase items={gallery} />
      <CTA data={home.cta} />
      <Contact data={home.contact} />
    </>
  );
}
