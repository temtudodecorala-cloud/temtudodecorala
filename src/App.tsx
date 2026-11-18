import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { StoreProvider } from './context/StoreContext';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductsPage } from './pages/ProductsPage';

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#1F1D1B]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/produto/:id" element={<ProductDetailPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;

