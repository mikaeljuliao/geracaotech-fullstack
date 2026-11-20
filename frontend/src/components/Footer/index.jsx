import Logo from '../Logo';
import Information from '../Information';
import './styles.css';

const informationGroups = [
  {
    title: 'Informacoes',
    informations: [
      { text: 'Sobre Drip Store', link: '/about' },
      { text: 'Blog', link: '/blog' },
      { text: 'Trabalhe conosco', link: '/careers' },
      { text: 'Meu Pedido', link: '/pedidos' },
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="footer__social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">x</a>
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
            { text: 'Calcas', link: '/produtos?filter=calcas' },
            { text: 'Bones', link: '/produtos?filter=bones' },
            { text: 'Headphones', link: '/produtos?filter=headphones' },
            { text: 'Tenis', link: '/produtos?filter=tenis' },
          ]}
        />
      </div>

      <hr className="footer__divider" />
      <p className="footer__copyright">© 2024 Digital Store</p>
    </footer>
  );
}
