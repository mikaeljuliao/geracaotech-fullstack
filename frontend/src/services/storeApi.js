import { mockCategories, mockProducts } from './mockData';

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

async function getWithTimeout(path, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function queryString(params) {
  return new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  ).toString();
}

export async function getProducts(params = {}) {
  try {
    const apiResult = await getWithTimeout(`/v1/product/search?${queryString(params)}`);
    if (apiResult?.data && Array.isArray(apiResult.data) && apiResult.data.length > 0) {
      return apiResult;
    }
  } catch {
    // Backend offline ou inacessível — ativa fallback automático local
  }

  // Filtragem local sobre o mock de produtos
  let result = [...mockProducts];

  if (params.match) {
    const term = params.match.toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        (product.brand && product.brand.toLowerCase().includes(term)),
    );
  }

  if (params.category_ids) {
    const ids = String(params.category_ids).split(',').map(Number);
    result = result.filter((product) =>
      product.category_ids.some((catId) => ids.includes(catId)),
    );
  }

  const total = result.length;
  const limit = params.limit ? Number(params.limit) : -1;

  if (limit > 0) {
    result = result.slice(0, limit);
  }

  return {
    data: result,
    total,
    limit,
    page: 1,
  };
}

export async function getProduct(id) {
  try {
    const apiProduct = await getWithTimeout(`/v1/product/${encodeURIComponent(id)}`);
    if (apiProduct && apiProduct.id) {
      return apiProduct;
    }
  } catch {
    // Backend offline — ativa fallback local
  }

  const numericId = Number(id);
  const found = mockProducts.find((item) => item.id === numericId) || mockProducts[0];
  return found;
}

export async function getCategories(params = { limit: -1 }) {
  try {
    const apiCategories = await getWithTimeout(`/v1/category/search?${queryString(params)}`);
    if (apiCategories?.data && Array.isArray(apiCategories.data) && apiCategories.data.length > 0) {
      return apiCategories;
    }
  } catch {
    // Backend offline — ativa fallback local
  }

  let list = [...mockCategories];
  const limit = params.limit ? Number(params.limit) : -1;

  if (limit > 0) {
    list = list.slice(0, limit);
  }

  return {
    data: list,
    total: mockCategories.length,
  };
}

export function toProductCard(product, categories = []) {
  const price = Number(product.price);
  const discount = Number(product.price_with_discount);
  const category = categories.find(({ id }) => product.category_ids?.includes(id));

  return {
    id: product.id,
    productPageId: product.id,
    name: product.name,
    image: product.images?.[0]?.content || '/featured-k-swiss.png',
    category: category?.name || 'Tênis',
    price,
    priceDiscount: discount > 0 && discount < price ? discount : undefined,
  };
}
