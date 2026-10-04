import { useEffect, useState } from 'react';
import { useSite } from '../../context/SiteContext.jsx';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import './AgeGate.css';

const KEY = 'cob_age_ok';

function isVerified() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const { exp } = JSON.parse(raw);
    return !exp || Date.now() < exp;
  } catch {
    return false;
  }
}

export default function AgeGate() {
  const { settings, loading } = useSite();
  const { t, lang, toggle } = useI18n();
  const [state, setState] = useState('checking'); // checking | ask | denied | ok

  const enabled = settings.age_gate_enabled !== 'false' && settings.age_gate_enabled !== false;
  const minAge = settings.min_age || '20';

  useEffect(() => {
    if (loading) return;
    if (!enabled || isVerified()) setState('ok');
    else setState('ask');
  }, [loading, enabled]);

  useEffect(() => {
    document.body.style.overflow = state === 'ask' || state === 'denied' ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [state]);

  if (state === 'ok' || state === 'checking') return null;

  const confirm = () => {
    const days = Number(settings.age_gate_expiry_days || 30);
    localStorage.setItem(KEY, JSON.stringify({ exp: Date.now() + days * 864e5 }));
    setState('ok');
  };

  return (
    <div className="agegate" role="dialog" aria-modal="true" aria-labelledby="agegate-title">
      <div className="agegate__bg" aria-hidden="true" />
      <div className="agegate__box">
        <button
          className="agegate__lang"
          onClick={toggle}
          aria-label={lang === 'en' ? 'Switch to Thai' : 'Switch to English'}
        >
          <span className={lang === 'en' ? 'is-active' : ''}>EN</span>
          <span aria-hidden="true">/</span>
          <span className={lang === 'th' ? 'is-active' : ''}>TH</span>
        </button>
        <div className="agegate__logo">{settings.brand_name || 'COB'}</div>
        {state === 'ask' ? (
          <>
            <h2 id="agegate-title" className="agegate__title">
              {t('age.title')}
            </h2>
            <p className="agegate__text">
              {t('age.text', { age: minAge })}
            </p>
            <div className="agegate__actions">
              <button className="btn btn--gold" onClick={confirm}>{t('age.yes')}</button>
              <button className="btn btn--light" onClick={() => setState('denied')}>
                {t('age.no')}
              </button>
            </div>
            <p className="agegate__note">{t('age.note')}</p>
          </>
        ) : (
          <>
            <h2 id="agegate-title" className="agegate__title">{t('age.deniedTitle')}</h2>
            <p className="agegate__text">
              {t('age.deniedText', { age: minAge })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
