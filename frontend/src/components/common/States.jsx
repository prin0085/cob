import { useI18n } from '../../i18n/LanguageContext.jsx';

export function Loading({ label }) {
  const { t } = useI18n();
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{(label || t('state.loading'))}…</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  const { t } = useI18n();
  return (
    <div className="state" role="alert">
      <p>{message || t('state.error')}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry} style={{ marginTop: 16 }}>
          {t('state.retry')}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }) {
  const { t } = useI18n();
  return (
    <div className="state">
      <p>{message || t('state.empty')}</p>
    </div>
  );
}
