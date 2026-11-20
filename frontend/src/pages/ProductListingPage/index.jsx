import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterGroup from '../../components/FilterGroup';
import ProductListing from '../../components/ProductListing';
import Layout from '../Layout';
import products from '../../data/products';
import './styles.css';

const categoryOptions = [
  { text: 'Esporte e lazer', value: 'Tênis' },
  { text: 'Casual', value: 'Camisetas' },
  { text: 'Utilitário', value: 'Acessórios' },
  { text: 'Corrida', value: 'Corrida' },
];

const brandOptions = [
  { text: 'Adidas' },
  { text: 'Balenciaga' },
  { text: 'K-Swiss' },
  { text: 'Nike' },
  { text: 'Puma' },
];

const genderOptions = [
  { text: 'Masculino' },
  { text: 'Feminino' },
  { text: 'Unisex', value: 'Unissex' },
];

const statusOptions = [
  { text: 'Novo' },
  { text: 'Usado' },
];

const defaultSneakerFilters = {
  brand: ['Adidas', 'K-Swiss'],
  category: ['Tênis'],
  gender: ['Masculino', 'Feminino'],
  status: 'Novo',
};

const emptyFilters = {
  brand: [],
  category: [],
  gender: [],
  status: '',
};

const sneakerSearchResults = Array.from({ length: 15 }, (_, index) => ({
  id: `sneaker-search-${index + 1}`,
  name: 'K-Swiss V8 - Masculino',
  image: '/featured-k-swiss.png',
  price: 200,
  ...(index < 2 ? { priceDiscount: 100 } : {}),
  brand: index % 2 === 0 ? 'K-Swiss' : 'Adidas',
  category: 'Tênis',
  gender: index % 2 === 0 ? 'Masculino' : 'Feminino',
  status: 'Novo',
}));

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

function createFilters(searchFilter) {
  return searchFilter === 'tenis'
    ? {
      ...defaultSneakerFilters,
      brand: [...defaultSneakerFilters.brand],
      category: [...defaultSneakerFilters.category],
      gender: [...defaultSneakerFilters.gender],
    }
    : { ...emptyFilters };
}

function hasDefaultSneakerFilters(filters) {
  return filters.brand.join('|') === defaultSneakerFilters.brand.join('|')
    && filters.category.join('|') === defaultSneakerFilters.category.join('|')
    && filters.gender.join('|') === defaultSneakerFilters.gender.join('|')
    && filters.status === defaultSneakerFilters.status;
}

export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get('filter') || '').trim();
  const searchFilter = normalizeText(searchTerm);
  const [sortOrder, setSortOrder] = useState('relevance');
  const [filters, setFilters] = useState(() => createFilters(searchFilter));
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const searchResults = searchFilter === 'tenis' ? sneakerSearchResults : products;

  useEffect(() => {
    setFilters(createFilters(searchFilter));
    setFilterPanelOpen(false);
  }, [searchFilter]);

  const filteredProducts = useMemo(() => {
    const result = searchResults.filter((product) => {
      const searchableText = normalizeText(
        `${product.name} ${product.category} ${product.brand}`,
      );
      const matchesSearch = !searchFilter || searchableText.includes(searchFilter);
      const matchesCategory = filters.category.length === 0
        || filters.category.includes(product.category);
      const matchesBrand = filters.brand.length === 0
        || filters.brand.includes(product.brand);
      const matchesGender = filters.gender.length === 0
        || filters.gender.includes(product.gender);
      const matchesStatus = !filters.status
        || (product.status || 'Novo') === filters.status;

      return matchesSearch
        && matchesCategory
        && matchesBrand
        && matchesGender
        && matchesStatus;
    });

    if (sortOrder !== 'relevance') {
      const priceOf = (product) => product.priceDiscount ?? product.price;
      result.sort((first, second) => (
        sortOrder === 'ascending'
          ? priceOf(first) - priceOf(second)
          : priceOf(second) - priceOf(first)
      ));
    }

    return result;
  }, [filters, searchFilter, searchResults, sortOrder]);

  function updateCheckboxFilter(filterName, value, checked) {
    setFilters((current) => ({
      ...current,
      [filterName]: checked
        ? [...current[filterName], value]
        : current[filterName].filter((selected) => selected !== value),
    }));
  }

  const resultCount = searchFilter === 'tenis' && hasDefaultSneakerFilters(filters)
    ? 389
    : filteredProducts.length;
  const resultTitle = searchTerm
    ? `Resultados para "${searchTerm[0].toLocaleUpperCase('pt-BR')}${searchTerm.slice(1)}"`
    : 'Todos os produtos';

  return (
    <Layout>
      <div className="product-listing-page">
        <div className="product-listing-page__inner">
          <div className="product-listing-page__toolbar">
            <p className="product-listing-page__summary">
              <strong>{resultTitle}</strong> - {resultCount} produtos
            </p>
            <div className="product-listing-page__controls">
              <label className="product-listing-page__sort" htmlFor="product-sort">
                <span>Ordenar por:</span>
                <select
                  id="product-sort"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                >
                  <option value="relevance">mais relevantes</option>
                  <option value="ascending">menor preço</option>
                  <option value="descending">maior preço</option>
                </select>
              </label>
              <button
                className="product-listing-page__filter-toggle"
                type="button"
                aria-label={filterPanelOpen ? 'Fechar filtros' : 'Abrir filtros'}
                aria-expanded={filterPanelOpen}
                onClick={() => setFilterPanelOpen((isOpen) => !isOpen)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 4h18l-7 8v6l-4 2v-8L3 4Z" />
                </svg>
              </button>
            </div>
          </div>

          {filterPanelOpen && (
            <button
              className="product-listing-page__filter-backdrop"
              type="button"
              aria-label="Fechar filtros"
              onClick={() => setFilterPanelOpen(false)}
            />
          )}

          <div className="product-listing-page__content">
            <aside
              className={`product-listing-page__sidebar${filterPanelOpen ? ' product-listing-page__sidebar--open' : ''}`}
              aria-label="Filtros de produtos"
            >
              <div className="product-listing-page__filters">
                <div className="product-listing-page__filters-heading">
                  <h2>Filtrar por</h2>
                  <button
                    className="product-listing-page__filter-close"
                    type="button"
                    aria-label="Fechar filtros"
                    onClick={() => setFilterPanelOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m5 5 14 14M19 5 5 19" />
                    </svg>
                  </button>
                </div>
                <FilterGroup
                  title="Marca"
                  name="brand"
                  options={brandOptions}
                  selectedValues={filters.brand}
                  onChange={(value, checked) => updateCheckboxFilter('brand', value, checked)}
                />
                <FilterGroup
                  title="Categoria"
                  name="category"
                  options={categoryOptions}
                  selectedValues={filters.category}
                  onChange={(value, checked) => updateCheckboxFilter('category', value, checked)}
                />
                <FilterGroup
                  title="Gênero"
                  name="gender"
                  options={genderOptions}
                  selectedValues={filters.gender}
                  onChange={(value, checked) => updateCheckboxFilter('gender', value, checked)}
                />
                <FilterGroup
                  title="Estado"
                  inputType="radio"
                  name="status"
                  options={statusOptions}
                  selectedValue={filters.status}
                  onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
                />
              </div>
            </aside>

            <div className="product-listing-page__results">
              {filteredProducts.length > 0 ? (
                <ProductListing products={filteredProducts} />
              ) : (
                <p className="product-listing-page__empty">
                  Nenhum produto encontrado com esses filtros.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
