import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterGroup from '../../components/FilterGroup';
import ProductListing from '../../components/ProductListing';
import { getCategories, getProducts, toProductCard } from '../../services/storeApi';
import Layout from '../Layout';
import './styles.css';

const productFields = 'id,enabled,name,price,price_with_discount,category_ids,images';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = (searchParams.get('filter') || '').trim();
  const categoryIds = searchParams.get('category_ids') || '';
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState('relevance');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getCategories({ limit: -1 })
      .then(({ data }) => {
        if (active) setCategories(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const params = { limit: -1, fields: productFields };
    if (searchTerm) params.match = searchTerm;
    if (categoryIds) params.category_ids = categoryIds;

    setLoading(true);
    setError('');
    getProducts(params)
      .then(({ data }) => {
        if (active) setProducts(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchTerm, categoryIds]);

  const visibleProducts = useMemo(() => {
    const result = products
      .filter((product) => product.enabled)
      .map((product) => toProductCard(product, categories));

    if (sortOrder === 'relevance') return result;
    return result.sort((first, second) => (
      sortOrder === 'ascending'
        ? (first.priceDiscount ?? first.price) - (second.priceDiscount ?? second.price)
        : (second.priceDiscount ?? second.price) - (first.priceDiscount ?? first.price)
    ));
  }, [categories, products, sortOrder]);

  function updateCategory(categoryId, checked) {
    const selected = categoryIds ? categoryIds.split(',') : [];
    const next = checked
      ? [...selected, categoryId]
      : selected.filter((id) => id !== categoryId);
    const nextParams = new URLSearchParams(searchParams);

    if (next.length) nextParams.set('category_ids', next.join(','));
    else nextParams.delete('category_ids');

    setSearchParams(nextParams);
  }

  const resultTitle = searchTerm
    ? `Resultados para "${searchTerm}"`
    : 'Todos os produtos';

  return (
    <Layout>
      <div className="product-listing-page">
        <div className="product-listing-page__inner">
          <div className="product-listing-page__toolbar">
            <p className="product-listing-page__summary">
              <strong>{resultTitle}</strong> - {visibleProducts.length} produtos
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
                  title="Categoria"
                  name="category"
                  options={categories.map(({ id, name }) => ({
                    text: name,
                    value: String(id),
                  }))}
                  selectedValues={categoryIds ? categoryIds.split(',') : []}
                  onChange={updateCategory}
                />
              </div>
            </aside>

            <div className="product-listing-page__results">
              {loading ? (
                <p className="product-listing-page__empty" role="status">
                  Carregando produtos...
                </p>
              ) : error ? (
                <p className="product-listing-page__empty" role="alert">{error}</p>
              ) : visibleProducts.length ? (
                <ProductListing products={visibleProducts} />
              ) : (
                <p className="product-listing-page__empty">
                  Nenhum produto encontrado.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
