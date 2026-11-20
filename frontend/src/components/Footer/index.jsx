import Logo from '../Logo';
import Information from '../Information';
import './styles.css';

const informationGroups = [
  {
    title: 'Informação',
    informations: [
      { text: 'Sobre Drip Store', link: '/about' },
      { text: 'Segurança', link: '/security' },
      { text: 'Wishlist', link: '/wishlist' },
      { text: 'Blog', link: '/blog' },
      { text: 'Trabalhe conosco', link: '/careers' },
      { text: 'Meus Pedidos', link: '/pedidos' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <Logo inverted />
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="footer__social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle className="footer__social-dot" cx="17.5" cy="6.5" r="1" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 6.2a7.5 7.5 0 0 1-2.1.6 3.7 3.7 0 0 0 1.6-2 7.4 7.4 0 0 1-2.4.9 3.7 3.7 0 0 0-6.4 2.5c0 .3 0 .6.1.8a10.5 10.5 0 0 1-7.6-3.9 3.7 3.7 0 0 0 1.1 4.9 3.7 3.7 0 0 1-1.7-.5v.1a3.7 3.7 0 0 0 3 3.6 3.8 3.8 0 0 1-1.7.1 3.7 3.7 0 0 0 3.4 2.6A7.4 7.4 0 0 1 3 18a10.4 10.4 0 0 0 5.7 1.7c6.8 0 10.5-5.6 10.5-10.5v-.5A7.5 7.5 0 0 0 21 6.2Z" />
              </svg>
            </a>
          </div>
        </div>

        {informationGroups.map((group) => (
          <Information
            key={group.title}
            title={group.title}
            informations={group.informations}
          />
        ))}

        <Information
          title="Categorias"
          informations={[
            { text: 'Camisetas', link: '/produtos?filter=camisetas' },
            { text: 'Calças', link: '/produtos?filter=calças' },
            { text: 'Bonés', link: '/produtos?filter=boné' },
            { text: 'Headphones', link: '/produtos?filter=headphones' },
            { text: 'Tênis', link: '/produtos?filter=tênis' },
          ]}
        />

        <div className="footer__contact">
          <h2>Contato</h2>
          <p>
            Av. Santos Dumont, 1510 - 1 andar - Aldeota, Fortaleza - CE,
            60150-161
          </p>
          <p>(85) 3051-3411</p>
        </div>
      </div>

      <hr className="footer__divider" />
      <p className="footer__copyright">© 2022 Digital College</p>
    </footer>
  );
}
