import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPriceBRL } from '../lib/format';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E7E0D6] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(31,29,27,0.12)]">
      <Link
        to={`/produto/${product.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2EDE6]"
      >
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#FAF8F5]/90 px-3 py-1 text-[11px] font-medium tracking-wide text-[#4E4842] backdrop-blur-sm">
          {product.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl font-semibold leading-snug text-[#1F1D1B]">
          {product.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-[#6B655E]">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F0EAE1] pt-4">
          <span className="text-lg font-semibold tracking-tight text-[#1F1D1B]">
            {formatPriceBRL(Number(product.price))}
          </span>

          <Link
            to={`/produto/${product.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1F1D1B] px-4 py-2 text-xs font-medium tracking-wide text-[#FAF8F5] transition-colors hover:bg-[#3A3531]"
          >
            Ver produto
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

