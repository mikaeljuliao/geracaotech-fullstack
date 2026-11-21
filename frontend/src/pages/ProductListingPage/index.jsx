import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterGroup from '../../components/FilterGroup';
import ProductListing from '../../components/ProductListing';
import { getCategories, getProducts, toProductCard } from '../../services/storeApi';
import Layout from '../Layout';

const productFields = 'id,enabled,name,price,price_with_discount,category_ids,images';

const brandOptions = [
  { text: 'Adiddas', value: 'adiddas' },
  { text: 'Calenciaga', value: 'calenciaga' },
  { text: 'K-Swiss', value: 'k-swiss' },
  { text: 'Nike', value: 'nike' },
  { text: 'Puma', value: 'puma' },
];

const genderOptions = [
  { text: 'Masculino', value: 'masculino' },
  { text: 'Feminino', value: 'feminino' },
  { text: 'Unisex', value: 'unisex' },
];

const conditionOptions = [
  { text: 'Novo', value: 'novo' },
  { text: 'Usado', value: 'usado' },
];

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = (searchParams.get('filter') || '').trim();
  const categoryIds = searchParams.get('category_ids') || '';
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState('relevance');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState(['adiddas', 'k-swiss']);
  const [selectedGenders, setSelectedGenders] = useState(['masculino', 'feminino']);
  const [selectedCondition, setSelectedCondition] = useState('novo');
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

  function updateBrand(brandValue, checked) {
    setSelectedBrands((current) =>
      checked ? [...current, brandValue] : current.filter((item) => item !== brandValue)
    );
  }

  function updateGender(genderValue, checked) {
    setSelectedGenders((current) =>
      checked ? [...current, genderValue] : current.filter((item) => item !== genderValue)
    );
  }

  const categoryOptions = categories.length > 0
    ? categories.map(({ id, name }) => ({ text: name, value: String(id) }))
    : [
        { text: 'Esporte e lazer', value: 'esporte' },
        { text: 'Casual', value: 'casual' },
        { text: 'Utilitário', value: 'utilitario' },
        { text: 'Corrida', value: 'corrida' },
      ];

  const resultTitle = searchTerm
    ? `Resultados para "${searchTerm}"`
    : 'Todos os produtos';

  return (
    <Layout>
      <div className="py-[60px] px-8 max-[1100px]:px-6 max-[650px]:py-6 max-[650px]:px-5 max-[650px]:pb-20 bg-[#f7f7fc]">
        <div className="w-full max-w-[1324px] mx-auto">

          {/* Toolbar */}
          <div className="flex items-start justify-between min-h-16 mb-10 max-[650px]:flex-col max-[650px]:items-stretch max-[650px]:min-h-0 max-[650px]:gap-4 max-[650px]:mb-6">
            <p className="mt-6 max-[650px]:mt-0 max-[650px]:order-1 text-dark-gray-3 max-[650px]:text-sm max-[650px]:leading-relaxed">
              <strong className="text-dark-gray-2 font-bold">{resultTitle}</strong>
              {' '}- {visibleProducts.length} produtos
            </p>

            <div className="flex max-[650px]:grid max-[650px]:grid-cols-[1fr_60px] max-[650px]:gap-2.5 max-[650px]:order-0">
              {/* Sort */}
              <label
                className="relative flex w-[356px] max-[650px]:w-full h-16 items-center gap-1.5 px-4 border border-dark-gray-3 rounded bg-white text-dark-gray-2 text-sm after:content-[''] after:w-2 after:h-2 after:border-r after:border-b after:border-dark-gray-2 after:pointer-events-none after:translate-y-[-2px] after:rotate-45"
                htmlFor="product-sort"
              >
                <span className="shrink-0 font-bold">Ordenar por:</span>
                <select
                  className="flex-1 min-w-0 border-0 outline-none appearance-none bg-transparent text-dark-gray-2 cursor-pointer"
                  id="product-sort"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                >
                  <option value="relevance">mais relevantes</option>
                  <option value="ascending">menor preço</option>
                  <option value="descending">maior preço</option>
                </select>
              </label>

              {/* Filter toggle (mobile only) */}
              <button
                className="hidden max-[650px]:grid w-[60px] h-[60px] place-items-center p-0 border-0 rounded-lg bg-primary cursor-pointer"
                type="button"
                aria-label={filterPanelOpen ? 'Fechar filtros' : 'Abrir filtros'}
                aria-expanded={filterPanelOpen}
                onClick={() => setFilterPanelOpen((isOpen) => !isOpen)}
              >
                <svg className="w-6 h-6 fill-none stroke-white stroke-[1.7]" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 4h18l-7 8v6l-4 2v-8L3 4Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile filter backdrop */}
          {filterPanelOpen && (
            <button
              className="fixed z-20 inset-x-0 bottom-0 top-[72px] bg-black/40 border-0 p-0 block min-[651px]:hidden"
              type="button"
              aria-label="Fechar filtros"
              onClick={() => setFilterPanelOpen(false)}
            />
          )}

          {/* Content */}
          <div className="grid grid-cols-[308px_minmax(0,1fr)] max-[1100px]:grid-cols-[240px_minmax(0,1fr)] max-[650px]:grid-cols-1 items-start gap-7 max-[1100px]:gap-6">

            {/* Sidebar */}
            <aside
              className={`min-w-0 max-[650px]:hidden ${
                filterPanelOpen
                  ? 'max-[650px]:!block max-[650px]:fixed max-[650px]:z-30 max-[650px]:top-[72px] max-[650px]:bottom-0 max-[650px]:left-0 max-[650px]:w-[min(308px,calc(100vw-67px))] max-[650px]:overflow-y-auto max-[650px]:bg-white'
                  : ''
              }`}
              aria-label="Filtros de produtos"
            >
              <div className="grid gap-9 max-[1100px]:gap-6 p-8 max-[1100px]:p-6 max-[650px]:p-7 max-[650px]:min-h-full rounded bg-white">
                {/* Filter heading */}
                <div className="flex items-center pb-5 border-b border-light-gray-2">
                  <h2 className="flex-1 m-0 text-dark-gray-2 text-base font-bold">Filtrar por</h2>
                  <button
                    className="hidden max-[650px]:grid w-6 h-6 place-items-center p-0 border-0 bg-transparent text-dark-gray-2 cursor-pointer"
                    type="button"
                    aria-label="Fechar filtros"
                    onClick={() => setFilterPanelOpen(false)}
                  >
                    <svg className="w-5 h-5 fill-none stroke-current stroke-[1.7]" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m5 5 14 14M19 5 5 19" />
                    </svg>
                  </button>
                </div>

                <FilterGroup
                  title="Marka"
                  name="brand"
                  inputType="checkbox"
                  options={brandOptions}
                  selectedValues={selectedBrands}
                  onChange={updateBrand}
                />

                <FilterGroup
                  title="Categoria"
                  name="category"
                  inputType="checkbox"
                  options={categoryOptions}
                  selectedValues={categoryIds ? categoryIds.split(',') : []}
                  onChange={updateCategory}
                />

                <FilterGroup
                  title="Gênero"
                  name="gender"
                  inputType="checkbox"
                  options={genderOptions}
                  selectedValues={selectedGenders}
                  onChange={updateGender}
                />

                <FilterGroup
                  title="Estado"
                  name="condition"
                  inputType="radio"
                  options={conditionOptions}
                  selectedValue={selectedCondition}
                  onChange={(val) => setSelectedCondition(val)}
                />
              </div>
            </aside>

            {/* Results */}
            <div className="min-w-0 [&_.product-listing]:grid-cols-3 max-[1100px]:[&_.product-listing]:grid-cols-2 max-[650px]:[&_.product-listing]:grid-cols-2 [&_.product-listing]:gap-x-4 [&_.product-listing]:gap-y-[60px] max-[1100px]:[&_.product-listing]:gap-y-9 max-[650px]:[&_.product-listing]:gap-y-12 max-[650px]:[&_.product-listing]:gap-x-2.5 [&_.product-card\_\_media]:h-[342px] [&_.product-card\_\_media]:overflow-hidden [&_.product-card\_\_media]:rounded max-[1100px]:[&_.product-card\_\_media]:h-auto max-[1100px]:[&_.product-card\_\_media]:[aspect-ratio:292/321] [&_.product-card\_\_details]:pt-6 max-[650px]:[&_.product-card\_\_details]:pt-3 [&_.product-card\_\_category]:mb-1 [&_.product-card\_\_category]:text-sm max-[650px]:[&_.product-card\_\_category]:text-xs [&_.product-card\_\_name]:overflow-hidden [&_.product-card\_\_name]:mb-1.5 [&_.product-card\_\_name]:text-2xl max-[650px]:[&_.product-card\_\_name]:text-base [&_.product-card\_\_name]:[text-overflow:ellipsis] [&_.product-card\_\_name]:whitespace-nowrap [&_.product-card\_\_prices]:gap-2 [&_.product-card\_\_price]:text-2xl max-[650px]:[&_.product-card\_\_price]:text-base [&_.product-card\_\_price--original]:text-sm">
              {loading ? (
                <p className="mt-8 text-dark-gray-2 text-base" role="status">
                  Carregando produtos...
                </p>
              ) : error ? (
                <p className="mt-8 text-dark-gray-2 text-base" role="alert">{error}</p>
              ) : visibleProducts.length ? (
                <ProductListing products={visibleProducts} />
              ) : (
                <p className="mt-8 text-dark-gray-2 text-base">
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
