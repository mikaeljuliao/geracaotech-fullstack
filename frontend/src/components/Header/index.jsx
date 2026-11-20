import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import './styles.css';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Produtos', to: '/products' },
  { label: 'Categorias', to: '/categorias' },
  { label: 'Meus Pedidos', to: '/pedidos' },
];

export default function Header() {
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  function searchProducts() {
    const query = filter.trim();
    navigate(query ? `/products?filter=${encodeURIComponent(query)}` : '/products');
  }

  return (
    <header className="header">
      <div className="header__main">
        <Link className="header__brand" to="/" aria-label="Ir para a pagina inicial">
          <Logo />
        </Link>

        <form
          className="header__search"
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

        <div className="header__actions">
          <Link className="header__register" to="/cadastro">Cadastre-se</Link>
          <Link className="header__login" to="/login">Entrar</Link>
          <button className="header__cart" type="button" aria-label="Carrinho de compras">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2l2.2 10h9.7l2.1-7H6" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="header__nav" aria-label="Navegacao principal">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (isActive ? 'header__nav-link active' : 'header__nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
