import Layout from '../Layout';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterGroup from '../../components/FilterGroup';
import ProductListing from '../../components/ProductListing';
import Section from '../../components/Section';
import products from '../../data/products';
import './styles.css';

const categoryOptions = [
  { text: 'Tênis' },
  { text: 'Camisetas' },
  { text: 'Acessórios' },
];

const brandOptions = [
  { text: 'Adidas' },
  { text: 'K-Swiss' },
  { text: 'Nike' },
  { text: 'Puma' },
];

const genderOptions = [
  { text: 'Todos', value: '' },
  { text: 'Feminino' },
  { text: 'Masculino' },
  { text: 'Unissex' },
];

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const [sortOrder, setSortOrder] = useState('');
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    gender: '',
  });
  const searchFilter = normalizeText((searchParams.get('filter') || '').trim());

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch = !searchFilter
        || normalizeText(product.name).includes(searchFilter);
      const matchesCategory = filters.category.length === 0
        || filters.category.includes(product.category);
      const matchesBrand = filters.brand.length === 0
        || filters.brand.includes(product.brand);
      const matchesGender = !filters.gender || product.gender === filters.gender;

      return matchesSearch && matchesCategory && matchesBrand && matchesGender;
    });

    if (sortOrder) {
      const priceOf = (product) => product.priceDiscount ?? product.price;
      result.sort((first, second) => (
        sortOrder === 'ascending'
          ? priceOf(first) - priceOf(second)
          : priceOf(second) - priceOf(first)
      ));
    }

    return result;
  }, [filters, searchFilter, sortOrder]);

  function updateCheckboxFilter(filterName, value, checked) {
    setFilters((current) => ({
      ...current,
      [filterName]: checked
        ? [...current[filterName], value]
        : current[filterName].filter((selected) => selected !== value),
    }));
  }

  return (
    <Layout>
      <div className="product-listing-page">
        <aside className="product-listing-page__sidebar" aria-label="Filtros de produtos">
          <label className="product-listing-page__sort-label" htmlFor="product-sort">
            Ordenar por
          </label>
          <select
            className="product-listing-page__sort"
            id="product-sort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="">Selecione</option>
            <option value="ascending">Menor preço</option>
            <option value="descending">Maior preço</option>
          </select>

          <div className="product-listing-page__filters">
            <h2>Filtrar por</h2>
            <FilterGroup
              title="Categoria"
              name="category"
              options={categoryOptions}
              selectedValues={filters.category}
              onChange={(value, checked) => updateCheckboxFilter('category', value, checked)}
            />
            <FilterGroup
              title="Marca"
              name="brand"
              options={brandOptions}
              selectedValues={filters.brand}
              onChange={(value, checked) => updateCheckboxFilter('brand', value, checked)}
            />
            <FilterGroup
              title="Gênero"
              inputType="radio"
              name="gender"
              options={genderOptions}
              selectedValue={filters.gender}
              onChange={(value) => setFilters((current) => ({ ...current, gender: value }))}
            />
          </div>
        </aside>

        <div className="product-listing-page__results">
          <Section
            title={`${filteredProducts.length} produtos encontrados`}
            titleAlign="left"
          >
            {filteredProducts.length > 0 ? (
              <ProductListing products={filteredProducts} />
            ) : (
              <p className="product-listing-page__empty">
                Nenhum produto encontrado com esses filtros.
              </p>
            )}
          </Section>
        </div>
      </div>
    </Layout>
  );
}
