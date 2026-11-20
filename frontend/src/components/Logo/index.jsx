import footerLogoMark from '../../assets/footer-logo-mark.png';
import './styles.css';

export default function Logo({ inverted = false }) {
  return (
    <span className={`logo ${inverted ? 'logo--inverted' : ''}`} aria-label="Digital Store">
      <span className="logo__mark" aria-hidden="true">
        {inverted ? (
          <img src={footerLogoMark} alt="" />
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="m8 7 5 5-5 5M14 16h4" />
          </svg>
        )}
      </span>
      <span className="logo__text">Digital Store</span>
    </span>
  );
}
