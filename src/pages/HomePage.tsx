import { ArrowRight, Sofa } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, type Category } from '../types';

export function HomePage() {
  const { products, loading, error } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>(
    'Todos'
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div>
      {/* Banner Principal */}
      <section className="relative mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#E9E2D8]">
          <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
            <img
              src="/hero-banner.jpg"
              alt="Sala de estar minimalista com móveis em tons neutros"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1D1B]/75 via-[#1F1D1B]/30 to-transparent sm:bg-gradient-to-r sm:from-[#1F1D1B]/75 sm:via-[#1F1D1B]/35 sm:to-transparent" />
          </div>

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:justify-center sm:p-12 lg:p-16">
            <div className="max-w-lg text-[#FAF8F5]">
              <span className="inline-block rounded-full border border-[#FAF8F5]/30 bg-[#FAF8F5]/10 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm">
                Curadoria para sua casa
              </span>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
                Móveis com alma minimalista e conforto real.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#EDE7DF] sm:text-base">
                Peças escolhidas para transformar cada ambiente com elegância,
                funcionalidade e atendimento direto pelo WhatsApp.
              </p>
              <div className="mt-6">
                <Link
                  to="/produtos"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FAF8F5] px-6 py-3 text-sm font-semibold text-[#1F1D1B] transition-colors hover:bg-[#EAE3D9]"
                >
                  Ver catálogo completo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias & Produtos Disponíveis */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8279]">
              Catálogo
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-[#1F1D1B] sm:text-4xl">
              Móveis disponíveis
            </h2>
          </div>

          {/* Filtro rápido de categorias */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias">
            {(['Todos', ...CATEGORIES] as const).map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#1F1D1B] text-[#FAF8F5]'
                      : 'border border-[#DDD5CA] bg-white text-[#5E5851] hover:border-[#1F1D1B] hover:text-[#1F1D1B]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-96 animate-pulse rounded-2xl border border-[#E7E0D6] bg-[#F2EDE6]"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8CFC4] bg-[#F5F1EB] px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E9E2D8] text-[#6B655E]">
              <Sofa className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-[#1F1D1B]">
              {selectedCategory === 'Todos'
                ? 'Nenhum produto cadastrado ainda'
                : `Nenhum móvel em ${selectedCategory}`}
            </h3>
            <p className="mt-2 max-w-md text-sm text-[#6B655E]">
              {selectedCategory === 'Todos'
                ? 'Os produtos adicionados pelo administrador no painel aparecerão aqui automaticamente.'
                : 'Tente selecionar outra categoria para visualizar os móveis disponíveis.'}
            </p>
            {selectedCategory !== 'Todos' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('Todos')}
                className="mt-5 rounded-full border border-[#1F1D1B] px-5 py-2 text-xs font-medium text-[#1F1D1B] transition-colors hover:bg-[#1F1D1B] hover:text-[#FAF8F5]"
              >
                Mostrar todas as categorias
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

