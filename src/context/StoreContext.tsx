import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Product, StoreSettings } from '../types';

interface StoreContextValue {
  products: Product[];
  settings: StoreSettings;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  whatsapp_number: '',
  store_name: 'Temtudo Decoralar',
  updated_at: '',
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [productsRes, settingsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('store_settings').select('*').eq('id', 1).maybeSingle(),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      setProducts((productsRes.data as Product[]) ?? []);
      if (settingsRes.data) {
        setSettings(settingsRes.data as StoreSettings);
      }
    } catch (err) {
      console.error('Erro ao carregar dados da loja:', err);
      setError('Não foi possível carregar os produtos no momento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreData();

    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('store-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchStoreData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        () => {
          fetchStoreData();
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [fetchStoreData]);

  return (
    <StoreContext.Provider
      value={{
        products,
        settings,
        loading,
        error,
        refresh: fetchStoreData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore deve ser usado dentro de StoreProvider');
  }
  return ctx;
}

