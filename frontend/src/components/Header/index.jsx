import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../Logo';
import './styles.css';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  { label: 'Categorias', to: '/produtos' },
  { label: 'Meus Pedidos', to: '/produtos' },
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
    <header className="header">
      <div className={`header__main${searchOpen ? ' header__main--search-open' : ''}`}>
        <button
          className="header__menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((isOpen) => !isOpen);
            setSearchOpen(false);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link className="header__brand" to="/" aria-label="Ir para a pagina inicial">
          <Logo />
        </Link>

        <form
          className={`header__search${searchOpen ? ' header__search--open' : ''}`}
          onSubmit={(event) => {
            event.preventDefault();
            searchProducts();
          }}
        >
          <input
            type="search"
            placeholder="Pesquisar produto..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <button type="submit" aria-label="Buscar produtos">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6" />
              <path d="M16 16l5 5" />
            </svg>
          </button>
        </form>

        <button
          className="header__search-open"
          type="button"
          aria-label={searchOpen ? 'Fechar pesquisa' : 'Abrir pesquisa'}
          aria-expanded={searchOpen}
          onClick={() => {
            setSearchOpen((isOpen) => !isOpen);
            setMenuOpen(false);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16l5 5" />
          </svg>
        </button>

        <div className="header__actions">
          <Link className="header__register" to="/cadastro">Cadastre-se</Link>
          <Link className="header__login" to="/login">Entrar</Link>
          <div className="header__cart" aria-label="Carrinho de compras">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2l2.2 10h9.7l2.1-7H6" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
            </svg>
            <span className="header__cart-count" aria-hidden="true">2</span>
          </div>
        </div>
      </div>

      {menuOpen && (
        <button
          className="header__mobile-backdrop"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <nav
        className={`header__nav${menuOpen ? ' header__nav--open' : ''}`}
        aria-label="Navegacao principal"
      >
        <h2 className="header__mobile-title">Páginas</h2>
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (
              isActive || (item.to === '/produtos' && pathname.startsWith('/product/'))
                ? 'header__nav-link active'
                : 'header__nav-link'
            )}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        <div className="header__mobile-auth">
          <Link className="header__mobile-login" to="/login" onClick={() => setMenuOpen(false)}>
            Entrar
          </Link>
          <Link className="header__mobile-register" to="/cadastro" onClick={() => setMenuOpen(false)}>
            Cadastre-se
          </Link>
        </div>
      </nav>
    </header>
  );
}
