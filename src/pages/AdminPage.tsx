import type { Session } from '@supabase/supabase-js';
import {
  Check,
  ImagePlus,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatPriceBRL } from '../lib/format';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { CATEGORIES, type Category, type Product } from '../types';

export function AdminPage() {
  const { products, settings, refresh } = useStore();

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Settings form
  const [storeName, setStoreName] = useState(settings.store_name);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Product form
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Sofás');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productFeedback, setProductFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setStoreName(settings.store_name);
    setWhatsappNumber(settings.whatsapp_number);
  }, [settings]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoggingIn(true);
    setLoginError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoginError('E-mail ou senha inválidos. Tente novamente.');
    }
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSavingSettings(true);
    setSettingsFeedback(null);

    const { error } = await supabase.from('store_settings').upsert({
      id: 1,
      store_name: storeName.trim() || 'Temtudo Decorala',
      whatsapp_number: whatsappNumber.trim(),
    });

    if (error) {
      setSettingsFeedback('Erro ao salvar configurações.');
    } else {
      setSettingsFeedback('Configurações salvas com sucesso!');
      await refresh();
    }
    setSavingSettings(false);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Sofás');
    setPrice('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(String(product.price));
    setDescription(product.description);
    setImageFile(null);
    setImagePreview(product.image_url);
    setProductFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    } else if (editingProduct) {
      setImagePreview(editingProduct.image_url);
    } else {
      setImagePreview(null);
    }
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const numericPrice = Number(price.replace(',', '.'));
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setProductFeedback({
        type: 'error',
        message: 'Informe um preço válido.',
      });
      return;
    }

    if (!editingProduct && !imageFile) {
      setProductFeedback({
        type: 'error',
        message: 'Selecione uma foto para o produto.',
      });
      return;
    }

    setSavingProduct(true);
    setProductFeedback(null);

    try {
      let imageUrl = editingProduct?.image_url ?? '';
      let imagePath = editingProduct?.image_path ?? null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;

        // Remove imagem antiga se estiver editando
        if (editingProduct?.image_path) {
          await supabase.storage
            .from('product-images')
            .remove([editingProduct.image_path]);
        }

        imagePath = filePath;
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: name.trim(),
            category,
            price: numericPrice,
            description: description.trim(),
            image_url: imageUrl,
            image_path: imagePath,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        setProductFeedback({
          type: 'success',
          message: 'Produto atualizado com sucesso!',
        });
      } else {
        const { error } = await supabase.from('products').insert({
          name: name.trim(),
          category,
          price: numericPrice,
          description: description.trim(),
          image_url: imageUrl,
          image_path: imagePath,
        });

        if (error) throw error;

        setProductFeedback({
          type: 'success',
          message: 'Produto adicionado com sucesso!',
        });
      }

      resetProductForm();
      await refresh();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setProductFeedback({
        type: 'error',
        message:
          'Não foi possível salvar o produto. Verifique as permissões do Supabase e tente novamente.',
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!supabase) return;
    const confirmed = window.confirm(
      `Deseja realmente excluir "${product.name}"?`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      if (error) throw error;

      if (product.image_path) {
        await supabase.storage
          .from('product-images')
          .remove([product.image_path]);
      }

      if (editingProduct?.id === product.id) {
        resetProductForm();
      }
      await refresh();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Não foi possível excluir o produto.');
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-[#DDD5CA] bg-white p-8 shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-[#1F1D1B]">
            Configuração do Supabase necessária
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6B655E]">
            Para ativar o painel administrativo, o armazenamento de fotos e o
            catálogo de móveis, configure as variáveis de ambiente no arquivo{' '}
            <code className="rounded bg-[#F2EDE6] px-1.5 py-0.5 text-xs text-[#1F1D1B]">
              .env
            </code>
            :
          </p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#1F1D1B] p-4 text-xs text-[#FAF8F5]">
            {`VITE_SUPABASE_URL=https://seu-projeto.supabase.co\nVITE_SUPABASE_ANON_KEY=sua-chave-anon-publica`}
          </pre>
          <p className="mt-4 text-sm text-[#6B655E]">
            Em seguida, execute o script{' '}
            <code className="rounded bg-[#F2EDE6] px-1.5 py-0.5 text-xs text-[#1F1D1B]">
              supabase/schema.sql
            </code>{' '}
            no SQL Editor do Supabase e crie o usuário administrador em
            Authentication &gt; Users.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-sm text-[#6B655E]">
        Verificando sessão...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-[#E7E0D6] bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2EDE6] text-[#1F1D1B]">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-center font-display text-3xl font-semibold text-[#1F1D1B]">
            Painel Administrativo
          </h1>
          <p className="mt-1 text-center text-sm text-[#6B655E]">
            Entre com sua conta de administrador para gerenciar os móveis.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]"
              >
                E-mail
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sua-loja.com"
                className="mt-1.5 w-full rounded-xl border border-[#DDD5CA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]"
              >
                Senha
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-[#DDD5CA] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none"
              />
            </div>

            {loginError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-full bg-[#1F1D1B] py-3 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#3A3531] disabled:opacity-60"
            >
              {loggingIn ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col gap-4 border-b border-[#E7E0D6] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8279]">
            Administração
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#1F1D1B] sm:text-4xl">
            Gerenciar Loja
          </h1>
          <p className="mt-1 text-xs text-[#6B655E]">
            Conectado como {session.user.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-full border border-[#DDD5CA] bg-white px-4 py-2 text-xs font-medium text-[#1F1D1B] transition-colors hover:border-[#1F1D1B]"
          >
            Ver vitrine
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#EFEAE2] px-4 py-2 text-xs font-medium text-[#1F1D1B] transition-colors hover:bg-[#E2DBD0]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Coluna Esquerda: Formulário de Produto + Configurações */}
        <div className="space-y-8 lg:col-span-5">
          {/* Formulário Adicionar / Editar Produto */}
          <section className="rounded-3xl border border-[#E7E0D6] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#1F1D1B]">
                {editingProduct ? 'Editar produto' : 'Adicionar produto'}
              </h2>
              {editingProduct && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="inline-flex items-center gap-1 text-xs text-[#6B655E] hover:text-[#1F1D1B]"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]">
                  Nome do produto
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sofá Retrátil 3 Lugares"
                  className="mt-1.5 w-full rounded-xl border border-[#DDD5CA] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="mt-1.5 w-full rounded-xl border border-[#DDD5CA] bg-[#FAF8F5] px-3 py-2.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]">
                    Preço (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1899,90"
                    className="mt-1.5 w-full rounded-xl border border-[#DDD5CA] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]">
                  Descrição
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dimensões, tecido, acabamento e diferenciais..."
                  className="mt-1.5 w-full rounded-xl border border-[#DDD5CA] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]">
                  Foto do móvel
                </label>
                <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#CFC6BA] bg-[#FAF8F5] p-4 text-center transition-colors hover:border-[#1F1D1B]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Prévia"
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center py-4 text-[#6B655E]">
                      <ImagePlus className="h-6 w-6" />
                      <span className="mt-2 text-xs font-medium">
                        Clique para selecionar uma imagem
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>

              {productFeedback && (
                <p
                  className={`rounded-xl px-3.5 py-2.5 text-xs ${
                    productFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {productFeedback.message}
                </p>
              )}

              <button
                type="submit"
                disabled={savingProduct}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1F1D1B] py-3 text-sm font-medium text-[#FAF8F5] transition-colors hover:bg-[#3A3531] disabled:opacity-60"
              >
                {editingProduct ? (
                  <>
                    <Save className="h-4 w-4" />
                    {savingProduct ? 'Salvando...' : 'Salvar alterações'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {savingProduct ? 'Adicionando...' : 'Adicionar produto'}
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Configurações da Loja (WhatsApp) */}
          <section className="rounded-3xl border border-[#E7E0D6] bg-white p-6">
            <h2 className="font-display text-2xl font-semibold text-[#1F1D1B]">
              Configurações da loja
            </h2>
            <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]">
                  Nome da loja
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Temtudo Decorala"
                  className="mt-1.5 w-full rounded-xl border border-[#DDD5CA] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#5E5851]">
                  Número do WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="5511999999999"
                  className="mt-1.5 w-full rounded-xl border border-[#DDD5CA] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#8A8279]">
                  Informe DDD + número (ex: 11999999999 ou 5511999999999).
                </p>
              </div>

              {settingsFeedback && (
                <p className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  {settingsFeedback}
                </p>
              )}

              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1F1D1B] py-2.5 text-xs font-semibold text-[#1F1D1B] transition-colors hover:bg-[#1F1D1B] hover:text-[#FAF8F5] disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {savingSettings ? 'Salvando...' : 'Salvar configurações'}
              </button>
            </form>
          </section>
        </div>

        {/* Coluna Direita: Lista de Produtos Cadastrados */}
        <div className="lg:col-span-7">
          <section className="rounded-3xl border border-[#E7E0D6] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-4">
              <h2 className="font-display text-2xl font-semibold text-[#1F1D1B]">
                Produtos cadastrados ({products.length})
              </h2>
            </div>

            {products.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#6B655E]">
                Nenhum produto cadastrado ainda. Use o formulário ao lado para
                adicionar o primeiro móvel.
              </p>
            ) : (
              <ul className="divide-y divide-[#F0EAE1]">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-16 w-20 shrink-0 rounded-xl bg-[#F2EDE6] object-cover"
                      />
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A8279]">
                          {product.category}
                        </span>
                        <h3 className="font-display text-xl font-semibold text-[#1F1D1B]">
                          {product.name}
                        </h3>
                        <p className="text-sm font-medium text-[#4E4842]">
                          {formatPriceBRL(Number(product.price))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEditProduct(product)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5CA] px-3.5 py-1.5 text-xs font-medium text-[#1F1D1B] transition-colors hover:border-[#1F1D1B]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

