import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../styles/LoginNew.css';
import logosWhite from '../assets/images/logos-grupo-white.png';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('action') === 'logout') localStorage.clear();
    }, [searchParams]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await authService.login(username, password);
            if (data.debe_cambiar_password) {
                localStorage.setItem('access_token', data.access); 
                navigate('/force-password-change');
                return;
            }
            localStorage.setItem('temp_token', data.access);
            localStorage.setItem('empresas_disponibles', JSON.stringify(data.empresas_disponibles));
            if (data.empresas_disponibles.length > 0) {
                const empresaPorDefecto = data.empresas_disponibles[0];
                const tokenData = await authService.selectEmpresa(empresaPorDefecto.id, data.access);
                localStorage.setItem('access_token', tokenData.access_token);
                navigate('/dashboard');
            } else {
                setError('Usuario sin asignación. Contacte a sistemas.');
                localStorage.clear();
            }
        } catch (err) {
            if (err.response && err.response.status === 401) setError('Credenciales incorrectas.');
            else setError('Error de conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-layout">
            
            {/* IZQUIERDA: VISUAL & BRANDING */}
            <div className="login-visual-section">
                <div className="visual-overlay">
                    {/* Animación del volcán transformándose en logo */}
                    <svg viewBox="0 0 400 400" className="volcano-animation" role="img" aria-label="Animación Volcán a MirAI">
                        {/* Triángulo grande del volcán (más ancho, proporción real) que se dibuja y transforma */}
                        <path className="volcano-outline" d="M200,80 L380,350 L20,350 Z" />
                        
                        {/* Logo MirAI que aparece después */}
                        <g className="mirai-logo-reveal">
                            <path className="circuito-linea-anim" d="M140,180 L170,180 L190,165" />
                            <circle className="circuito-anillo-anim" cx="190" cy="165" r="6" />
                            <path className="circuito-linea-anim" d="M120,210 L170,210 L190,190 L220,190" />
                            <circle className="circuito-anillo-anim" cx="220" cy="190" r="6" />
                            <path className="triangulo-anim" d="M190,80 L270,230 L110,230 Z" />
                            <text x="100" y="310" className="texto-mir-anim">Mir</text>
                            <text x="230" y="310" className="texto-ai-anim">AI</text>
                        </g>
                    </svg>
                    
                    <div className="visual-content">
                        <h1 className="visual-title">Hub Corporativo</h1>
                        <h1 className="visual-tag">SISTEMA INTEGRADO DE GESTIÓN</h1>
                        <div className="visual-divider"></div>
                    </div>
                    
                    {/* Aquí van los logos blancos, limpios, al pie */}
                    <div className="visual-footer">
                        <img src={logosWhite} alt="Grupo Corporativo" className="logos-group-img" />
                    </div>
                </div>
            </div>

            {/* DERECHA: FORMULARIO */}
            <div className="login-form-section">
                <div className="form-container">
                    <div className="form-header">
                        {/* Logo del volcán con explosión */}
                        <svg className="logo-svg-login" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
                            {/* Partículas de explosión */}
                            <circle className="particle particle-1" cx="100" cy="60" r="3" fill="#75c900"/>
                            <circle className="particle particle-2" cx="100" cy="60" r="3" fill="#23b7e5"/>
                            <circle className="particle particle-3" cx="100" cy="60" r="3" fill="#c2185b"/>
                            <circle className="particle particle-4" cx="100" cy="60" r="3" fill="#f59e0b"/>
                            <circle className="particle particle-5" cx="100" cy="60" r="3" fill="#9b59b6"/>
                            <circle className="particle particle-6" cx="100" cy="60" r="3" fill="#75c900"/>
                            <circle className="particle particle-7" cx="100" cy="60" r="3" fill="#23b7e5"/>
                            <circle className="particle particle-8" cx="100" cy="60" r="3" fill="#c2185b"/>
                            
                            {/* Base del volcán con animación de colores */}
                            <path id="base" className="volcano-base-animated" d="M 10 120 Q 100 140 190 120 L 185 125 Q 100 145 15 125 Z" fill="#8A3D9E" stroke="#6b2d7d" strokeWidth="2"/>
                            {/* Volcán principal con líneas más gruesas */}
                            <path id="volcano-main" d="M 60 122 L 90 60 L 110 60 L 140 122 Z" fill="#4CAF50" stroke="#2d5f2f" strokeWidth="3"/>
                            {/* Nieve */}
                            <path id="volcano-snow" d="M 90 60 L 110 60 L 125 91 L 120 88 L 115 91 L 110 88 L 105 91 L 100 88 L 95 91 L 90 88 L 85 91 L 80 88 L 75 91 Z" fill="#FFFFFF" stroke="#e0e0e0" strokeWidth="1"/>
                        </svg>
                        <h2>Iniciar Sesión</h2>
                        <p>Ingrese sus credenciales para acceder.</p>
                    </div>

                    {error && (
                        <div className="login-alert">
                            <i className="alert-icon">!</i> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="modern-form">
                        <div className="input-group">
                            <label>Usuario</label>
                            <input 
                                type="text" 
                                placeholder="nombre.apellido"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="input-group">
                            <label>Contraseña</label>
                            <div className="password-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} // Dinámico
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button 
                                    type="button" // Importante para no enviar el form
                                    className="btn-eye"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Ocultar" : "Mostrar"}
                                >
                                    {showPassword ? (
                                        // Icono Ojo Abierto
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        // Icono Ojo Cerrado (Tachado)
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="form-extras">
                            <Link to="/forgot-password" className="link-reset">¿Olvidaste tu contraseña?</Link>
                        </div>

                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? <span className="spinner"></span> : 'Acceder'}
                        </button>
                    </form>
                    
                    <div className="form-footer-mobile">
                        {/* Solo visible en móvil si la imagen no carga */}
                        <small>© Grupo Provefrut S.A.</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;