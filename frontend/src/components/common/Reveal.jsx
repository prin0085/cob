import { useReveal } from '../../hooks/useReveal.js';
import './Reveal.css';

// Fade/slide-up on scroll. Respects prefers-reduced-motion via CSS.
export default function Reveal({ children, as: Tag = 'div', delay = 0, className = '', ...rest }) {
  const [ref, revealed] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${revealed ? 'is-revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
