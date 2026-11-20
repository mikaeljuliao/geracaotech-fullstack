import { Link } from 'react-router-dom';
import './styles.css';

export default function Section({
  title,
  mobileTitle,
  titleAlign = 'left',
  link,
  children,
}) {
  const alignment = titleAlign === 'center' ? 'center' : 'left';
  const isInternalLink = link?.href?.startsWith('/') === true;

  return (
    <section className="section">
      {title && (
        <div className={`section__heading section__heading--${alignment}`}>
          <h2 className="section__title">
            <span className="section__title-text--desktop">{title}</span>
            {mobileTitle && (
              <span className="section__title-text--mobile">{mobileTitle}</span>
            )}
          </h2>
          {link && (
            isInternalLink ? (
              <Link className="section__link" to={link.href}>
                {link.text}
              </Link>
            ) : (
              <a className="section__link" href={link.href}>
                {link.text}
              </a>
            )
          )}
        </div>
      )}
      {children}
    </section>
  );
}
