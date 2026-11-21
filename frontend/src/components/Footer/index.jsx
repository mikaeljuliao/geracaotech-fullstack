import Logo from '../Logo';
import Information from '../Information';

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
    <footer className="footer mt-auto bg-dark-gray text-white pt-12 pb-7 px-6 md:pt-20 md:pb-[25px] md:px-8">
      <div className="footer__inner max-w-[1240px] mx-auto">
        <div className="footer__content grid grid-cols-2 min-[701px]:grid-cols-[1.8fr_0.8fr_0.8fr_1fr] gap-x-6 gap-y-10 md:gap-12">
          <div className="footer__brand col-span-2 min-[701px]:col-span-1">
            <Logo inverted />
            <p className="max-w-[390px] my-3.5 md:my-7 text-xs md:text-sm leading-relaxed text-white">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="footer__social flex items-center gap-5 md:gap-6">
              <a
                className="inline-flex w-5 h-5 items-center justify-center text-white hover:text-primary transition-colors"
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z" />
                </svg>
              </a>
              <a
                className="inline-flex w-5 h-5 items-center justify-center text-white hover:text-primary transition-colors"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                  <rect className="fill-none stroke-current stroke-2" x="3" y="3" width="18" height="18" rx="5" />
                  <circle className="fill-none stroke-current stroke-2" cx="12" cy="12" r="4" />
                  <circle className="fill-current stroke-none" cx="17.5" cy="6.5" r="1" />
                </svg>
              </a>
              <a
                className="inline-flex w-5 h-5 items-center justify-center text-white hover:text-primary transition-colors"
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
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

          <div className="footer__contact col-span-2 min-[701px]:col-span-1">
            <h2 className="m-0 mb-3 md:mb-6 text-white text-sm md:text-lg font-bold">Contato</h2>
            <p className="m-0 mb-2.5 md:mb-4 text-white text-xs md:text-sm leading-normal md:leading-relaxed">
              Av. Santos Dumont, 1510 - 1 andar - Aldeota, Fortaleza - CE,
              60150-161
            </p>
            <p className="m-0 text-white text-xs md:text-sm leading-normal md:leading-relaxed">(85) 3051-3411</p>
          </div>
        </div>

        <hr className="footer__divider my-8 md:my-[30px] border-0 border-t border-white/30" />
        <p className="footer__copyright m-0 text-center text-[11px] md:text-[13px] text-white">© 2024 Digital Store</p>
      </div>
    </footer>
  );
}
