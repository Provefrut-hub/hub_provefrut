import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { authService } from '../services/api';
import '../styles/DashboardNew.css';

const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [empresas, setEmpresas] = useState([]);
    const navigate = useNavigate();

    // DICCIONARIO DE COLORES POR EMPRESA
    const themeColors = {
        'PVF': '#285d2f', // Provefrut (Verde)
        'NTG': '#712d7d', // Nintanga (Morado)
        'PCG': '#0056b3', // Procongelados (Azul)
        'default': '#334155'
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const listaEmpresas = localStorage.getItem('empresas_disponibles');

        if (!token) { navigate('/login'); return; }

        try {
            const decoded = jwtDecode(token);
            setUser(decoded);
            if (listaEmpresas) setEmpresas(JSON.parse(listaEmpresas));

            // APLICAR TEMA DINÁMICO
            const color = themeColors[decoded.empresa_codigo] || themeColors['default'];
            document.documentElement.style.setProperty('--primary', color);
            document.documentElement.style.setProperty('--primary-hover', adjustColor(color, -20)); // Oscurecer

        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    const handleCambioEmpresa = async (event) => {
        const nuevaEmpresaId = event.target.value;
        const tempToken = localStorage.getItem('temp_token'); 
        try {
            const data = await authService.selectEmpresa(nuevaEmpresaId, tempToken);
            localStorage.setItem('access_token', data.access_token);
            window.location.reload(); // Recarga para aplicar tema nuevo limpiamente
        } catch (error) {
            alert("Error al cambiar empresa");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Helper para botones
    const lanzarApp = (baseUrl) => {
    const token = localStorage.getItem('access_token');
    
    // 1. Defensa: Si la variable de entorno viene vacía, no hagas nada (evita abrir 'undefined/...')
    if (!baseUrl) {
        console.error("URL de la aplicación no definida");
        return;
    }

    // 2. Normalización: Elimina la barra final (/) si existe para evitar dobles barras (//)
    const cleanUrl = baseUrl.replace(/\/$/, '');

    // 3. Construcción: Asegura el protocolo. Si tu variable .env NO tiene https, esto lo arregla en código.
    const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

    // 4. Ejecución: Abre la aplicación en la misma pestaña (reemplaza el Hub)
    window.location.href = `${finalUrl}/sso-login/#token=${token}`;
};

    if (!user) return null;

    // --- RENDERIZADO ---
    return (
        <div className="dashboard-container">
            {/* TOPBAR */}
            <header className="topbar">
                <div className="topbar-left">
                    <div className="logo-area">
                        <svg viewBox="0 0 350 320" className="mirai-logo-dashboard" role="img" aria-label="Logo MirAI">
                            <path className="circuito-linea" d="M115,155 L155,155 L180,130" />
                            <circle className="circuito-anillo" cx="180" cy="130" r="8" />
                            <path className="circuito-linea" d="M90,195 L155,195 L180,170 L215,170" />
                            <circle className="circuito-anillo" cx="215" cy="170" r="8" />
                            <path className="triangulo" d="M175,40 L275,220 L75,220 Z" />
                            <text x="55" y="300" className="texto-mir">Mir</text>
                            <text x="218" y="300" className="texto-ai">AI</text>
                        </svg>
                        <div>
                            <h1 className="company-name">{user.empresa_nombre}</h1>
                            <span className="portal-badge">Hub Corporativo</span>
                        </div>
                    </div>
                </div>

                <div className="topbar-right">
                    <div className="context-selector">
                        <label>Cambiar Empresa:</label>
                        <select value={user.empresa_id} onChange={handleCambioEmpresa}>
                            {empresas.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="user-profile" onClick={handleLogout} title="Cerrar Sesión">
                        <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <span className="name">{user.nombre_completo}</span>
                            <span className="role">{user.rol_nombre}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="main-grid">
                <div className="welcome-banner">
                    <h2>👋 Hola, {user.nombre_completo.split(' ')[0]}</h2>
                    <p>Selecciona una aplicación para comenzar a trabajar en <strong>{user.empresa_nombre}</strong>.</p>
                </div>

                <div className="apps-grid">
                    {/* CONDICIÓN LÓGICA:
                       Si tiene permiso && Muestra la tarjeta.
                       Si no tiene permiso, no muestra NADA.
                    */}

                    {/* 1. COMPRAS */}
                    {user.permisos?.includes('core.compras_acceso') && (
                        <AppCard 
                            title="Gestión de Compras"
                            desc="Requisiciones, órdenes y proveedores."
                            icon="🛒"
                            color={themeColors[user.empresa_codigo]}
                            active={true} // Siempre true porque si entra aquí, tiene permiso
                            onClick={() => lanzarApp(import.meta.env.VITE_URL_COMPRAS)}
                        />
                    )}

                    {/* 2. CHATBOT */}
                    {user.permisos?.includes('core.chatbot_acceso') && (
                        <AppCard 
                            title="Chatbot de Ayuda"
                            desc="Asistente de Políticas y Preguntas Frecuentes (FAQ)"
                            icon="🤖"
                            color="#6366f1"
                            active={true}
                            onClick={() => lanzarApp(import.meta.env.VITE_URL_CHATBOT)}
                        />
                    )}

                    {/* 3. INVENTARIO */}
                    {user.permisos?.includes('core.inventario_acceso') && (
                        <AppCard 
                            title="Inventario y Bodega"
                            desc="Control de stock y movimientos."
                            icon="📦"
                            color="#f59e0b"
                            active={true}
                            onClick={() => alert("Próximamente")}
                        />
                    )}

                    {/* 4. MANTENIMIENTO - SOLO NINTANGA */}
                    {user.permisos?.includes('core.mantenimiento_acceso') && 
                     (user.empresa_codigo === 'NTG' || user.empresa_nombre?.includes('Nintanga')) && (
                        <AppCard 
                            title="Gestión de Mantenimiento"
                            desc="Órdenes de trabajo, equipos y mantenimiento preventivo."
                            icon="🔧"
                            color="#712d7d"
                            active={true}
                            onClick={() => lanzarApp(import.meta.env.VITE_URL_MANTENIMIENTO)}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

// COMPONENTE TARJETA REUTILIZABLE
const AppCard = ({ title, desc, icon, active, onClick, color }) => (
    <div 
        className={`app-card ${!active ? 'disabled' : ''}`} 
        onClick={active ? onClick : null}
        style={{ '--card-accent': color || 'var(--primary)' }}
    >
        <div className="card-icon">{icon}</div>
        <div className="card-content">
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
        {active ? <span className="arrow">→</span> : <span className="lock">🔒</span>}
    </div>
);

// Helper simple para oscurecer color (para hover)
function adjustColor(color, amount) {
    return color; // Simplificado para este ejemplo, idealmente usar una lib pequeña
}

export default DashboardPage;