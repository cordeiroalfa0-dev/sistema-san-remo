import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { AdicionarMaterial } from './pages/AdicionarMaterial'
import { ListaMateriais } from './pages/ListaMateriais'
import { Relatorios } from './pages/Relatorios'
import { EnviarMateriais } from './pages/EnviarMateriais'
import { Transferencias as HistoricoEnvios } from './pages/Transferencias'
import { Backup } from './pages/Backup'
import { Cadastro } from './pages/Cadastro'
import { Admin } from './pages/Admin'
import { GerenciamentoUsuarios } from './pages/GerenciamentoUsuarios'
import { Manual } from './pages/Manual'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota de Login (pública) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/adicionar" element={<AdicionarMaterial />} />
                    <Route path="/lista" element={<ListaMateriais />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/enviar" element={<EnviarMateriais />} />
                    <Route path="/historico-envios" element={<HistoricoEnvios />} />
                    <Route path="/manual" element={<Manual />} />
                    
                    {/* Rotas de Administração - Apenas para Admin */}
                    <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
                    <Route path="/backup" element={<ProtectedRoute adminOnly><Backup /></ProtectedRoute>} />
                    <Route path="/cadastro" element={<ProtectedRoute adminOnly><Cadastro /></ProtectedRoute>} />
                    <Route path="/usuarios" element={<ProtectedRoute adminOnly><GerenciamentoUsuarios /></ProtectedRoute>} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
