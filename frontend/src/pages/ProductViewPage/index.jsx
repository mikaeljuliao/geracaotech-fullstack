import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BuyBox from '../../components/BuyBox';
import Gallery from '../../components/Gallery';
import ProductListing from '../../components/ProductListing';
import ProductOptions from '../../components/ProductOptions';
import Section from '../../components/Section';
import { getCategories, getProduct, getProducts, toProductCard } from '../../services/storeApi';
import Layout from '../Layout';

const productFields = 'id,enabled,name,price,price_with_discount,category_ids,images';
const galleryBackgrounds = ['#E4E4FE', '#FFE9C7', '#FFC2C4', '#E3D0A7', '#E9E0D3'];

export default function ProductViewPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedError, setRelatedError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    setRelatedProducts([]);
    Promise.all([getProduct(id), getCategories({ limit: -1 })])
      .then(([productData, categoryResponse]) => {
        if (active) {
          setProduct(productData);
          setCategories(categoryResponse.data);
        }
      })
      .catch((requestError) => {
        if (active) {
          setProduct(null);
          setError(requestError.status === 404
            ? 'Produto não encontrado.'
            : requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product) return undefined;
    let active = true;
    const params = { limit: 5, fields: productFields };
    if (product.category_ids.length) {
      params.category_ids = String(product.category_ids[0]);
    }

    getProducts(params)
      .then(({ data }) => {
        if (active) {
          setRelatedProducts(
            data.filter((item) => item.id !== product.id && item.enabled)
              .slice(0, 4)
              .map((item) => toProductCard(item, categories)),
          );
        }
      })
      .catch((requestError) => {
        if (active) setRelatedError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [categories, product]);

  const categoryNames = product?.category_ids
    .map((categoryId) => categories.find((category) => category.id === categoryId)?.name)
    .filter(Boolean) || [];
  const categoryName = categoryNames.join(', ');
  const images = product?.images?.length
    ? product.images.map((image, index) => ({
        src: image.content,
        alt: `${product.name} - imagem ${index + 1}`,
        background: galleryBackgrounds[index % galleryBackgrounds.length],
      }))
    : [
        {
          src: '/featured-k-swiss.png',
          alt: product?.name || 'Produto',
          background: galleryBackgrounds[0],
        },
      ];

  return (
    <Layout defaultSearchTerm={categoryName}>
      {loading ? (
        <div className="max-w-[1240px] min-h-80 mx-auto py-20 px-8 text-dark-gray-2" role="status">
          Carregando produto...
        </div>
      ) : error ? (
        <div className="max-w-[1240px] min-h-80 mx-auto py-20 px-8 text-dark-gray-2" role="alert">
          <h1>{error}</h1>
          <Link to="/produtos">Voltar aos produtos</Link>
        </div>
      ) : (
        <div className="w-full pt-7 pb-[149px] max-[650px]:pt-3.5 max-[650px]:pb-24 px-8 max-[650px]:px-4 bg-[#f7f7fc]">
          <div className="max-w-[1240px] mx-auto">

            {/* Breadcrumb */}
            <nav
              className="mb-[43px] max-[650px]:mb-3"
              aria-label="Navegação estrutural"
            >
              <ol className="flex flex-wrap items-center gap-2 max-[650px]:gap-1.5 m-0 p-0 text-dark-gray-2 text-xs max-[650px]:text-[11px] list-none">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Produtos', to: '/produtos' },
                  ...categoryNames.map((name, index) => ({
                    label: name,
                    to: `/produtos?category_ids=${product.category_ids[index]}`,
                    key: product.category_ids[index],
                  })),
                ].map((crumb) => (
                  <li key={crumb.key || crumb.label} className="inline-flex items-center gap-2 max-[650px]:gap-1.5 after:content-['/'] after:text-dark-gray-3">
                    <Link className="text-inherit no-underline hover:text-primary transition-colors" to={crumb.to}>
                      {crumb.label}
                    </Link>
                  </li>
                ))}
                <li className="inline-flex items-center gap-2 max-[650px]:gap-1.5">
                  <span aria-current="page">{product.name}</span>
                </li>
              </ol>
            </nav>

            {/* Gallery + BuyBox */}
            <div className="grid grid-cols-[minmax(0,700px)_minmax(280px,1fr)] max-[1050px]:grid-cols-1 items-start gap-10 max-[1050px]:gap-10 max-[650px]:gap-8 mb-24 max-[650px]:mb-16">

              {/* Gallery wrapper */}
              <div
                className="product-view-gallery min-w-0 max-[650px]:gap-2 [&_.gallery\_\_viewport]:h-[570px] max-[1050px]:[&_.gallery\_\_viewport]:h-[min(70vw,570px)] max-[650px]:[&_.gallery\_\_viewport]:!h-auto max-[650px]:[&_.gallery\_\_viewport]:[aspect-ratio:1.224/1] [&_.gallery\_\_arrow]:w-10 [&_.gallery\_\_arrow]:h-10 [&_.gallery\_\_arrow]:p-2.5 [&_.gallery\_\_arrow]:rounded-none [&_.gallery\_\_arrow]:bg-transparent [&_.gallery\_\_arrow]:text-dark-gray-2 [&_.gallery\_\_arrow--previous]:left-2 [&_.gallery\_\_arrow--next]:right-2 [&_.gallery\_\_thumbnails]:gap-7 max-[650px]:[&_.gallery\_\_thumbnails]:gap-[7px] max-[650px]:[&_.gallery\_\_thumbnails]:overflow-x-auto max-[650px]:[&_.gallery\_\_thumbnails]:[scrollbar-width:none] [&_.gallery\_\_thumbnail]:grid [&_.gallery\_\_thumbnail]:place-items-center [&_.gallery\_\_thumbnail]:border max-[650px]:[&_.gallery\_\_thumbnail]:w-[50px] max-[650px]:[&_.gallery\_\_thumbnail]:h-[46px] max-[650px]:[&_.gallery\_\_thumbnail]:[flex-basis:50px] [&_.gallery\_\_thumbnail_img]:w-[82%] [&_.gallery\_\_thumbnail_img]:h-[70%] max-[650px]:[&_.gallery\_\_thumbnail_img]:w-[75%] [&_.gallery\_\_thumbnail_img]:object-contain"
              >
                <Gallery
                  className="w-full"
                  images={images}
                  showThumbs
                  width="700px"
                  height="570px"
                  radius="4px"
                  renderSlide={(image) => (
                    <div
                      className="grid w-full h-full place-items-center"
                      style={{ backgroundColor: image.background }}
                    >
                      <img
                        className="w-[67%] h-[76%] object-contain"
                        src={image.src}
                        alt={image.alt}
                        onError={(e) => {
                          e.currentTarget.src = '/White-Sneakers-PNG-Clipart 1.png';
                        }}
                      />
                    </div>
                  )}
                />
              </div>

              {/* BuyBox */}
              <BuyBox
                name={product.name}
                category={categoryName}
                reference={String(product.id).padStart(8, '0')}
                stars={4.7}
                rating={90}
                stock={product.stock}
                price={Number(product.price)}
                priceDiscount={
                  Number(product.price_with_discount) > 0
                    && Number(product.price_with_discount) < Number(product.price)
                    ? Number(product.price_with_discount)
                    : undefined
                }
                description={product.description}
              >
                {(product.options || []).map((option) => (
                  <div
                    className="grid gap-3 max-[650px]:gap-2"
                    key={option.id}
                  >
                    <h2 className="m-0 text-dark-gray-2 text-sm max-[650px]:text-xs font-bold">{option.title}</h2>
                    <ProductOptions
                      options={Array.isArray(option.values) ? option.values : (option.values || '').split(',')}
                      shape={option.shape}
                      type={option.type}
                      radius={`${option.radius || 0}px`}
                    />
                  </div>
                ))}
              </BuyBox>
            </div>

            {/* Related products */}
            {relatedError ? (
              <p role="alert">{relatedError}</p>
            ) : relatedProducts.length > 0 ? (
              <div className="[&_.section\_\_title]:text-[22px] max-[650px]:[&_.section\_\_title]:text-lg [&_.section\_\_title-text--mobile]:hidden max-[650px]:[&_.section\_\_title-text--mobile]:inline max-[650px]:[&_.section\_\_title-text--desktop]:hidden [&_.product-listing>a:nth-child(n+3)]:max-[650px]:hidden [&_.product-card\_\_details]:max-[650px]:pt-2.5 [&_.product-card\_\_category]:max-[650px]:mb-1 [&_.product-card\_\_category]:max-[650px]:text-[11px] [&_.product-card\_\_name]:max-[650px]:text-sm [&_.product-card\_\_name]:max-[650px]:overflow-hidden [&_.product-card\_\_name]:max-[650px]:[text-overflow:ellipsis] [&_.product-card\_\_name]:max-[650px]:whitespace-nowrap [&_.product-card\_\_prices]:max-[650px]:flex-nowrap [&_.product-card\_\_prices]:max-[650px]:gap-2 [&_.product-card\_\_price]:max-[650px]:text-sm [&_.product-card\_\_price--original]:max-[650px]:text-xs">
                <Section
                  title="Produtos Relacionados"
                  mobileTitle="Coleções em destaque"
                  titleAlign="left"
                  link={{
                    text: 'Ver todos →',
                    href: product.category_ids.length
                      ? `/produtos?category_ids=${product.category_ids[0]}`
                      : '/produtos',
                  }}
                >
                  <ProductListing products={relatedProducts} />
                </Section>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Layout>
  );
}
