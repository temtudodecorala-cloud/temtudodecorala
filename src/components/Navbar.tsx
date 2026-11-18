import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export function Navbar() {
  const { settings } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const storeName = settings.store_name?.trim() || 'Temtudo Decorala';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide transition-colors ${
      isActive
        ? 'text-[#1F1D1B] font-semibold'
        : 'text-[#6B655E] hover:text-[#1F1D1B]'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E7E0D6] bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3 group"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/logo.jpg"
            alt={storeName}
            className="h-11 w-11 rounded-xl border border-[#2F2B27] bg-black object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-display text-2xl font-semibold tracking-tight text-[#1F1D1B]">
            {storeName}
          </span>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden items-center gap-8 sm:flex" aria-label="Navegação principal">
          <NavLink to="/" end className={linkClass}>
            Início
          </NavLink>
          <NavLink to="/produtos" className={linkClass}>
            Produtos
          </NavLink>
        </nav>

        {/* Botão Mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-[#1F1D1B] hover:bg-[#EFEAE2] sm:hidden"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu Mobile */}
      {mobileOpen && (
        <nav
          className="border-t border-[#E7E0D6] bg-[#FAF8F5] px-4 py-4 sm:hidden"
          aria-label="Navegação mobile"
        >
          <div className="flex flex-col gap-3">
            <NavLink
              to="/"
              end
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              Início
            </NavLink>
            <NavLink
              to="/produtos"
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              Produtos
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

