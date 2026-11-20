const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000")
  .replace(/\/$/, "");

async function get(path) {
  const response = await fetch(`${apiUrl}${path}`);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || "Não foi possível carregar os dados.");
    error.status = response.status;
    throw error;
  }

  return data;
}

function queryString(params) {
  return new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  ).toString();
}

export function getProducts(params = {}) {
  return get(`/v1/product/search?${queryString(params)}`);
}

export function getProduct(id) {
  return get(`/v1/product/${encodeURIComponent(id)}`);
}

export function getCategories(params = { limit: -1 }) {
  return get(`/v1/category/search?${queryString(params)}`);
}

export function toProductCard(product, categories = []) {
  const price = Number(product.price);
  const discount = Number(product.price_with_discount);
  const category = categories.find(({ id }) =>
    product.category_ids?.includes(id),
  );

  return {
    id: product.id,
    productPageId: product.id,
    name: product.name,
    image: product.images?.[0]?.content || '/featured-k-swiss.png',
    category: category?.name,
    price,
    priceDiscount: discount > 0 && discount < price ? discount : undefined,
  };
}
