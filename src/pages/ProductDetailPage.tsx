import { ArrowLeft, MessageCircle, Sofa } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { buildWhatsAppUrl, formatPriceBRL } from '../lib/format';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products, settings, loading: storeLoading } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = products.find((item) => item.id === id);
    if (existing) {
      setProduct(existing);
      setLoading(false);
      return;
    }

    if (storeLoading) return;

    if (!isSupabaseConfigured || !supabase || !id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setProduct((data as Product) ?? null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, products, storeLoading]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-[#F2EDE6]" />
          <div className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded-full bg-[#F2EDE6]" />
            <div className="h-12 w-3/4 animate-pulse rounded-xl bg-[#F2EDE6]" />
            <div className="h-8 w-36 animate-pulse rounded-xl bg-[#F2EDE6]" />
            <div className="h-28 w-full animate-pulse rounded-xl bg-[#F2EDE6]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EFEAE2] text-[#6B655E]">
          <Sofa className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-[#1F1D1B]">
          Produto não encontrado
        </h1>
        <p className="mt-2 text-sm text-[#6B655E]">
          Este móvel pode ter sido removido ou o link está incorreto.
        </p>
        <Link
          to="/produtos"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1F1D1B] px-6 py-2.5 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#3A3531]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos produtos
        </Link>
      </div>
    );
  }

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    product.name,
    Number(product.price)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/produtos"
        className="inline-flex items-center gap-2 text-sm text-[#6B655E] transition-colors hover:text-[#1F1D1B]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para produtos
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-start">
        {/* Foto do Produto */}
        <div className="overflow-hidden rounded-3xl border border-[#E7E0D6] bg-[#F2EDE6] lg:col-span-7">
          <img
            src={product.image_url}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        {/* Informações e Botão WhatsApp */}
        <div className="flex flex-col lg:col-span-5 lg:pt-2">
          <span className="inline-flex w-fit rounded-full border border-[#DDD5CA] bg-[#F5F1EB] px-3.5 py-1 text-xs font-medium tracking-wide text-[#5E5851]">
            {product.category}
          </span>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-[#1F1D1B] sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-[#1F1D1B]">
            {formatPriceBRL(Number(product.price))}
          </p>

          <div className="mt-6 border-t border-[#E7E0D6] pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A8279]">
              Descrição
            </h2>
            <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-[#4E4842]">
              {product.description}
            </p>
          </div>

          <div className="mt-8">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#1E6B4B] px-6 py-4 text-sm font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-[#17553B]"
              >
                <MessageCircle className="h-5 w-5" />
                Comprar pelo WhatsApp
              </a>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                O número de WhatsApp da loja ainda não foi configurado pelo
                administrador.
              </div>
            )}
            <p className="mt-3 text-center text-xs text-[#8A8279]">
              Você será direcionado ao WhatsApp da loja com os dados deste
              produto preenchidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

