import './styles.css';

export default function Logo({ inverted = false }) {
  return (
    <span className={`logo ${inverted ? 'logo--inverted' : ''}`} aria-label="Digital Store">
      <span className="logo__mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="logo__text">Digital Store</span>
    </span>
  );
}
