import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PdvPage } from './pages/PdvPage';
import { CozinhaPage } from './pages/CozinhaPage';
import { PedidosPage } from './pages/PedidosPage';
import { ProdutosPage } from './pages/ProdutosPage';
import { InsumosPage } from './pages/InsumosPage';
import { CategoriasPage } from './pages/CategoriasPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<AppLayout />}>
              <Route path="/pdv" element={<PdvPage />} />
              <Route path="/pedidos" element={<PedidosPage />} />
              <Route path="/cozinha" element={<CozinhaPage />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/insumos" element={<InsumosPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route path="/" element={<Navigate to="/pdv" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
