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
    <header className="header bg-white pt-5 pb-5 px-5 md:pt-[34px] md:pb-8 md:px-8 border-b border-light-gray-3 md:border-b-0">
      <div className="max-w-[1240px] mx-auto">
        <div
          className={`header__main grid items-center max-[600px]:grid-cols-[24px_minmax(0,1fr)_24px_24px] max-[600px]:grid-rows-[32px_auto] max-[600px]:gap-x-2.5 max-[600px]:gap-y-0 min-[601px]:max-[900px]:grid-cols-[1fr_auto] min-[601px]:max-[900px]:gap-4 min-[901px]:max-[1200px]:grid-cols-[253px_minmax(260px,1fr)_auto] min-[1201px]:grid-cols-[253px_minmax(0,1fr)_348px] gap-8 ${
            searchOpen ? 'max-[600px]:row-gap-3.5' : ''
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
            className={`header__search h-[60px] items-center bg-light-gray-3 rounded-lg overflow-hidden min-[601px]:flex min-[601px]:max-[900px]:col-span-full min-[601px]:max-[900px]:row-start-2 min-[901px]:w-[calc(100%-17px)] ${
              searchOpen
                ? 'max-[600px]:flex max-[600px]:col-span-full max-[600px]:row-start-2 max-[600px]:w-full max-[600px]:bg-[#f7f7f7]'
                : 'max-[600px]:hidden'
            }`}
            onSubmit={(event) => {
              event.preventDefault();
              searchProducts();
            }}
          >
            <input
              className="flex-1 h-full min-w-0 border-0 outline-none bg-transparent px-6 max-[600px]:px-5 text-dark-gray text-base placeholder:text-light-gray"
              type="search"
              placeholder="Pesquisar produto..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <button
              className="w-16 max-[600px]:w-11 h-full border-0 bg-transparent cursor-pointer flex items-center justify-center"
              type="submit"
              aria-label="Buscar produtos"
            >
              <svg className="w-6 h-6 fill-none stroke-light-gray stroke-2" viewBox="0 0 24 24" aria-hidden="true">
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

        {menuOpen && (
          <button
            className="header__mobile-backdrop fixed z-20 inset-x-0 bottom-0 top-[72px] bg-black/40 border-0 p-0 block min-[601px]:hidden"
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <nav
          className={`header__nav flex gap-8 mt-7 max-[600px]:mt-0 max-[600px]:fixed max-[600px]:z-30 max-[600px]:top-[72px] max-[600px]:left-0 max-[600px]:w-[min(308px,calc(100vw-67px))] max-[600px]:flex-col max-[600px]:gap-0 max-[600px]:p-7 max-[600px]:bg-white max-[600px]:max-h-[calc(100vh-72px)] max-[600px]:overflow-y-auto max-[600px]:shadow-xl ${
            menuOpen ? 'max-[600px]:flex' : 'max-[600px]:hidden'
          }`}
          aria-label="Navegacao principal"
        >
          <h2 className="header__mobile-title hidden max-[600px]:block m-0 mb-5 text-dark-gray-2 text-base font-bold leading-tight">
            Páginas
          </h2>
          {navigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => {
                const active = isActive || (item.to === '/produtos' && pathname.startsWith('/product/'));
                return `header__nav-link relative text-base no-underline py-1 pb-3 max-[600px]:py-3 max-[600px]:pb-2.5 transition-colors ${
                  active
                    ? 'header__nav-link--active text-primary font-bold after:content-[\'\'] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-primary max-[600px]:after:w-12 max-[600px]:after:right-auto max-[600px]:after:bottom-[6px]'
                    : 'text-dark-gray-2 hover:text-primary'
                }`;
              }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="header__mobile-auth hidden max-[600px]:flex max-[600px]:flex-col max-[600px]:items-center max-[600px]:gap-5 max-[600px]:mt-6 max-[600px]:pt-6 max-[600px]:border-t max-[600px]:border-light-gray-2 max-[600px]:w-full">
            <Link
              className="header__mobile-login inline-flex w-full min-h-[44px] items-center justify-center rounded-lg bg-primary text-white text-base font-bold no-underline hover:bg-tertiary transition-colors"
              to="/login"
              onClick={() => setMenuOpen(false)}
            >
              Entrar
            </Link>
            <Link
              className="header__mobile-register text-dark-gray-2 text-base underline underline-offset-[3px] text-center hover:text-primary transition-colors"
              to="/cadastro"
              onClick={() => setMenuOpen(false)}
            >
              Cadastre-se
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
