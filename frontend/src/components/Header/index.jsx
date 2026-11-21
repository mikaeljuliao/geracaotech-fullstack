import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../Logo';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  { label: 'Categorias', to: '/categorias' },
  { label: 'Meus Pedidos', to: '/meus-pedidos' },
];

function capitalizeFirst(value) {
  return value
    ? `${value[0].toLocaleUpperCase('pt-BR')}${value.slice(1)}`
    : '';
}

export default function Header({ defaultSearchTerm = '' }) {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const searchTerm = searchParams.get('filter') || defaultSearchTerm;
  const [filter, setFilter] = useState(() => capitalizeFirst(searchTerm));
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFilter(capitalizeFirst(searchTerm));
  }, [searchTerm]);

  function searchProducts() {
    const query = filter.trim();
    navigate(query ? `/products?filter=${encodeURIComponent(query)}` : '/products');
    setSearchOpen(false);
  }

  return (
    <header className="header bg-white pt-5 pb-5 px-5 md:pt-[34px] md:pb-8 md:px-8 border-b border-light-gray-3 md:border-b-0 w-full max-w-full min-w-0">
      <div className="max-w-[1240px] w-full min-w-0 mx-auto">
        <div
          className={`header__main grid items-center max-[600px]:grid-cols-[24px_minmax(0,1fr)_24px_24px] max-[600px]:grid-rows-[32px_auto] max-[600px]:gap-x-3 min-[601px]:max-[900px]:grid-cols-[1fr_auto] min-[601px]:max-[900px]:gap-4 min-[901px]:max-[1200px]:grid-cols-[253px_minmax(260px,1fr)_auto] min-[1201px]:grid-cols-[253px_minmax(0,1fr)_348px] gap-8 ${
            searchOpen ? 'max-[600px]:gap-y-4' : 'max-[600px]:gap-y-0'
          }`}
        >
          <button
            className="header__menu-toggle hidden max-[600px]:grid col-start-1 w-6 h-6 place-items-center p-0 border-0 bg-transparent text-dark-gray-2 cursor-pointer"
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((isOpen) => !isOpen);
              setSearchOpen(false);
            }}
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-[1.6]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            className="header__brand no-underline flex max-[600px]:justify-center col-start-2 max-[600px]:col-start-2 min-[601px]:col-start-1"
            to="/"
            aria-label="Ir para a pagina inicial"
          >
            <Logo />
          </Link>

          <form
            className={`header__search h-[60px] max-[600px]:h-[48px] items-center bg-light-gray-3 rounded-lg overflow-hidden min-[601px]:flex min-[601px]:max-[900px]:col-span-full min-[601px]:max-[900px]:row-start-2 min-[901px]:w-[calc(100%-17px)] ${
              searchOpen
                ? 'max-[600px]:flex max-[600px]:col-span-full max-[600px]:row-start-2 max-[600px]:w-full max-[600px]:mt-2 max-[600px]:bg-light-gray-3'
                : 'max-[600px]:hidden'
            }`}
            onSubmit={(event) => {
              event.preventDefault();
              searchProducts();
            }}
          >
            <input
              className="flex-1 h-full min-w-0 border-0 outline-none bg-transparent px-6 max-[600px]:px-4 text-dark-gray text-base max-[600px]:text-sm placeholder:text-light-gray"
              type="search"
              placeholder="Pesquisar produto..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <button
              className="w-16 max-[600px]:w-12 h-full border-0 bg-transparent cursor-pointer flex items-center justify-center text-light-gray"
              type="submit"
              aria-label="Buscar produtos"
            >
              <svg className="w-6 h-6 max-[600px]:w-5 max-[600px]:h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <path d="M16 16l5 5" />
              </svg>
            </button>
          </form>

          <button
            className="header__search-open hidden max-[600px]:grid col-start-3 w-6 h-6 place-items-center p-0 border-0 bg-transparent text-primary cursor-pointer"
            type="button"
            aria-label={searchOpen ? 'Fechar pesquisa' : 'Abrir pesquisa'}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((isOpen) => !isOpen);
              setMenuOpen(false);
            }}
          >
            <svg className="w-[19px] h-[19px] fill-none stroke-current stroke-[1.7]" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6" />
              <path d="M16 16l5 5" />
            </svg>
          </button>

          <div className="header__actions flex items-center gap-8 max-[1200px]:gap-6 max-[900px]:gap-3.5 whitespace-nowrap max-[600px]:col-start-4 max-[600px]:justify-end">
            <Link className="header__register text-dark-gray-2 text-lg max-[1200px]:text-base underline underline-offset-[3px] hover:text-primary transition-colors max-[600px]:hidden" to="/cadastro">
              Cadastre-se
            </Link>
            <Link className="header__login inline-flex w-[114px] max-[900px]:w-[90px] h-10 items-center justify-center rounded bg-primary text-white text-sm font-bold no-underline hover:bg-tertiary transition-colors max-[600px]:hidden" to="/login">
              Entrar
            </Link>
            <div className="header__cart relative w-8 h-8 p-1 ml-10 max-[1200px]:ml-0 max-[600px]:w-6 max-[600px]:h-6 max-[600px]:p-0.5 border-0 bg-transparent cursor-default" aria-label="Carrinho de compras">
              <svg className="w-full h-full fill-none stroke-primary stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 4h2l2.2 10h9.7l2.1-7H6" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="17" cy="19" r="1.5" />
              </svg>
              <span className="header__cart-count absolute -top-0.5 -right-0.5 max-[600px]:-top-1 max-[600px]:-right-1 grid w-3.5 h-3.5 max-[600px]:w-3 max-[600px]:h-3 place-items-center rounded-full bg-error text-white text-[10px] max-[600px]:text-[9px] font-bold leading-none" aria-hidden="true">
                2
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Backdrop & Drawer Menu (Cobrir toda a altura da tela no mobile conforme Figma) */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 min-[601px]:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {menuOpen && (
          <aside
            className="fixed inset-y-0 left-0 z-50 w-[min(308px,80vw)] h-screen bg-white shadow-2xl p-7 flex flex-col justify-between overflow-y-auto min-[601px]:hidden"
            aria-label="Menu lateral mobile"
          >
            <div>
              <h2 className="m-0 mb-6 text-dark-gray-2 text-base font-bold leading-tight">
                Páginas
              </h2>
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => {
                      const active = isActive || (item.to === '/produtos' && pathname.startsWith('/product/'));
                      return `relative text-base no-underline py-2.5 transition-colors ${
                        active
                          ? 'text-primary font-bold after:content-[\'\'] after:absolute after:left-0 after:bottom-1 after:w-12 after:h-0.5 after:bg-primary'
                          : 'text-dark-gray-2 hover:text-primary'
                      }`;
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-6 border-t border-light-gray-2 w-full mt-auto">
              <Link
                className="inline-flex w-full min-h-[44px] items-center justify-center rounded-lg bg-primary text-white text-base font-bold no-underline hover:bg-tertiary transition-colors"
                to="/login"
                onClick={() => setMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link
                className="text-dark-gray-2 text-base underline underline-offset-[3px] text-center hover:text-primary transition-colors"
                to="/cadastro"
                onClick={() => setMenuOpen(false)}
              >
                Cadastre-se
              </Link>
            </div>
          </aside>
        )}

        {/* Desktop Navigation */}
        <nav
          className="header__nav hidden min-[601px]:flex gap-8 mt-7"
          aria-label="Navegacao principal"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => {
                const active = isActive || (item.to === '/produtos' && pathname.startsWith('/product/'));
                return `header__nav-link relative text-base no-underline py-1 pb-3 transition-colors ${
                  active
                    ? 'header__nav-link--active text-primary font-bold after:content-[\'\'] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-primary'
                    : 'text-dark-gray-2 hover:text-primary'
                }`;
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
