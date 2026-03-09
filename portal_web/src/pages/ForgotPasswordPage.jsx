import React, { useState } from 'react';
import { authService } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/AuthPages.css'; // Importamos el nuevo CSS

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authService.requestPasswordReset(email);
            setMessage('Si el correo existe en nuestro sistema, recibirás un enlace de recuperación en breve.');
            setEnviado(true);
        } catch (err) {
            setError('Ocurrió un problema al procesar tu solicitud. Inténtalo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon-wrapper">📧</div>
                    <h1 className="auth-title">Recuperar Acceso</h1>
                    <p className="auth-subtitle">
                        Ingresa tu correo electrónico corporativo y te enviaremos las instrucciones.
                    </p>
                </div>

                {message && <div className="auth-alert success">✅ {message}</div>}
                {error && <div className="auth-alert error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-field">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            placeholder="ej. nombre@provefrut.com"
                            autoFocus
                        />
                    </div>
                    
                    <button type="submit" className="btn-auth" disabled={loading || enviado}>
                        {loading ? <span className="spinner-sm"></span> : enviado ? 'Enlace enviado ✓' : 'Enviar Enlace de Recuperación'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login" className="back-link">
                        ← Volver al Inicio de Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;