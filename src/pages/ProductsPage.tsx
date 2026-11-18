import { Search, Sofa } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, type Category } from '../types';

export function ProductsPage() {
  const { products, loading, error } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoria');

  const validInitialCategory: Category | 'Todos' =
    initialCategory && CATEGORIES.includes(initialCategory as Category)
      ? (initialCategory as Category)
      : 'Todos';

  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>(
    validInitialCategory
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const param = searchParams.get('categoria');
    if (param && CATEGORIES.includes(param as Category)) {
      setSelectedCategory(param as Category);
    } else if (!param) {
      setSelectedCategory('Todos');
    }
  }, [searchParams]);

  const handleCategoryChange = (category: Category | 'Todos') => {
    setSelectedCategory(category);
    if (category === 'Todos') {
      searchParams.delete('categoria');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ categoria: category }, { replace: true });
    }
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-[#E7E0D6] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8279]">
          Todos os móveis
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[#1F1D1B] sm:text-5xl">
          Produtos
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#6B655E]">
          Explore nossa seleção por categoria ou busque pelo móvel ideal para o
          seu espaço.
        </p>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            {(['Todos', ...CATEGORIES] as const).map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
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

          {/* Busca */}
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8279]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar móvel..."
              className="w-full rounded-full border border-[#DDD5CA] bg-white py-2 pl-10 pr-4 text-sm text-[#1F1D1B] placeholder:text-[#9B938A] focus:border-[#1F1D1B] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
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
          <h2 className="mt-4 font-display text-2xl font-semibold text-[#1F1D1B]">
            Nenhum móvel encontrado
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#6B655E]">
            {products.length === 0
              ? 'Ainda não há produtos cadastrados na loja.'
              : 'Não encontramos móveis com os filtros selecionados.'}
          </p>
          {(selectedCategory !== 'Todos' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('Todos');
              }}
              className="mt-5 rounded-full border border-[#1F1D1B] px-5 py-2 text-xs font-medium text-[#1F1D1B] transition-colors hover:bg-[#1F1D1B] hover:text-[#FAF8F5]"
            >
              Limpar filtros
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
    </div>
  );
}

