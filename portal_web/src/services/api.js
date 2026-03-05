import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// =================================================================
// 0. CONFIGURACIÓN DINÁMICA DE URL
// =================================================================
// ESTRATEGIA:
// 1. En Producción (Amplify): Usará la variable VITE_API_URL que configuraremos en la consola.
// 2. En Local: Usará '/api/' para que el Proxy de Vite (vite.config.js) maneje la redirección a tu backend local.
const baseURL = import.meta.env.VITE_API_URL || '/api/';

console.log("🚀 Conectando a API en:", baseURL); // Log para depuración en consola del navegador

// =================================================================
// UTILIDAD: Verificar si el token está expirado
// =================================================================
const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convertir a segundos
        
        // Si el token expira en menos de 1 minuto, considerarlo expirado
        return decoded.exp < (currentTime + 60);
    } catch (error) {
        console.error("Error decodificando token:", error);
        return true;
    }
};

// =================================================================
// UTILIDAD: Limpiar sesión y redirigir al login
// =================================================================
const logoutAndRedirect = () => {
    console.warn("⚠️ Sesión expirada, redirigiendo al login...");
    localStorage.clear();
    if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
};

// 1. Configuración Base de Axios
const api = axios.create({
    baseURL: baseURL, 
    headers: {
        'Content-Type': 'application/json',
    }
});

// =================================================================
// INTERCEPTOR DE SOLICITUD (Salida) -> Inyecta el Token
// =================================================================
api.interceptors.request.use(
    (config) => {
        const storedToken = localStorage.getItem('access_token');
        
        // Verificar si el token está expirado ANTES de hacer la petición
        if (storedToken && isTokenExpired(storedToken)) {
            logoutAndRedirect();
            return Promise.reject(new Error('Token expirado'));
        }
        
        // Si hay token y la petición no tiene uno manual, lo inyectamos
        if (storedToken && !config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// =================================================================
// INTERCEPTOR DE RESPUESTA (Entrada) -> Maneja Errores 401
// =================================================================
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Si el servidor responde con error 401 (No autorizado)
        if (error.response && error.response.status === 401) {
            console.warn("⚠️ Acceso Denegado o Sesión Expirada (401)");

            // Evitar bucle infinito si ya estamos en login
            if (!window.location.pathname.includes('/login')) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// =================================================================
// SERVICIOS DE AUTENTICACIÓN
// =================================================================
export const authService = {
    login: async (username, password) => {
        const response = await api.post('login/', { username, password });
        return response.data;
    },

    selectEmpresa: async (empresa_id, token_temporal) => {
        if (!token_temporal) throw new Error("Token temporal perdido");
        
        const response = await api.post('select-empresa/', 
            { empresa_id }, 
            { headers: { 'Authorization': `Bearer ${token_temporal}` } }
        );
        return response.data;
    },

    getMisEmpresas: async () => {
        const response = await api.get('mis-empresas/');
        return response.data;
    },

    requestPasswordReset: async (email) => {
        const response = await api.post('password-reset/', { email });
        return response.data;
    },

    confirmPasswordReset: async (uidb64, token, password) => {
        const response = await api.post('password-reset-confirm/', {
            uidb64,
            token,
            password
        });
        return response.data;
    },

    cambiarPasswordObligatorio: async (password) => {
        const response = await api.post('cambiar-password-obligatorio/', { password });
        return response.data;
    }
};

// =================================================================
// VERIFICACIÓN PERIÓDICA DEL TOKEN (cada 1 minuto)
// =================================================================
setInterval(() => {
    const token = localStorage.getItem('access_token');
    if (token && isTokenExpired(token)) {
        logoutAndRedirect();
    }
}, 60000); // Verificar cada 60 segundos

// Exportar utilidades
export { isTokenExpired, logoutAndRedirect };
export default api;