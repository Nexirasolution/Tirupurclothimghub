import { notFound } from 'next/navigation';
import { getProductPageData } from '@/lib/products';
import ProductClient from './ProductClient';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params; // on Next 14 use: const { slug } = params;
  const data = await getProductPageData(slug);
  if (!data?.product) return {};
  return {
    title: data.product.name,
    description: data.product.description?.slice(0, 160),
    openGraph: { images: data.product.variants?.[0]?.images?.[0] ? [data.product.variants[0].images[0]] : [] },
  };
}

export default async function Page({ params }) {
  const { slug } = await params; // on Next 14 use: const { slug } = params;
  const data = await getProductPageData(slug);
  if (!data?.product) notFound();
  return <ProductClient data={data} />;
}