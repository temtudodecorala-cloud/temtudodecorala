import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../types';

export function Footer() {
  const { settings } = useStore();
  const storeName = settings.store_name?.trim() || 'Temtudo Decoralar';

  return (
    <footer className="border-t border-[#E7E0D6] bg-[#F3EFE9] text-[#6B655E]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt={storeName}
                className="h-10 w-10 rounded-xl border border-[#2F2B27] bg-black object-cover"
              />
              <p className="font-display text-2xl font-semibold text-[#1F1D1B]">
                {storeName}
              </p>
            </div>
            <p className="mt-2 max-w-xs text-sm leading-relaxed">
              Móveis selecionados com design atemporal, conforto e atendimento
              direto pelo WhatsApp.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1F1D1B]">
              Categorias
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    to={`/produtos?categoria=${encodeURIComponent(category)}`}
                    className="transition-colors hover:text-[#1F1D1B]"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1F1D1B]">
              Navegação
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm sm:items-end">
              <Link to="/" className="transition-colors hover:text-[#1F1D1B]">
                Início
              </Link>
              <Link
                to="/produtos"
                className="transition-colors hover:text-[#1F1D1B]"
              >
                Produtos
              </Link>
              <Link
                to="/admin"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8A8279] transition-colors hover:text-[#1F1D1B]"
              >
                <Lock className="h-3.5 w-3.5" />
                Painel Administrativo
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#E3DBD0] pt-6 text-xs text-[#8A8279]">
          <p>
            © {new Date().getFullYear()} {storeName}. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

