import { Link } from 'react-router-dom';

export default function Section({
  title,
  mobileTitle,
  titleAlign = 'left',
  link,
  children,
}) {
  const isInternalLink = link?.href?.startsWith('/') === true;

  return (
    <section className="w-full min-w-0 max-w-full">
      {title && (
        <div
          className={`relative flex items-center min-h-[32px] mb-5 max-[520px]:items-start max-[520px]:gap-3 ${
            titleAlign === 'center' ? 'justify-center max-[520px]:justify-start' : 'justify-start'
          }`}
        >
          <h2 className="m-0 text-dark-gray-2 text-[24px] font-bold">
            <span className={mobileTitle ? 'hidden sm:inline' : ''}>{title}</span>
            {mobileTitle && (
              <span className="sm:hidden">{mobileTitle}</span>
            )}
          </h2>
          {link && (
            isInternalLink ? (
              <Link
                className="absolute right-0 text-primary text-[18px] no-underline hover:underline max-[520px]:static max-[520px]:ml-auto"
                to={link.href}
              >
                {link.text}
              </Link>
            ) : (
              <a
                className="absolute right-0 text-primary text-[18px] no-underline hover:underline max-[520px]:static max-[520px]:ml-auto"
                href={link.href}
              >
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
