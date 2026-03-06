#!/usr/bin/env python3
"""
Script de diagnóstico para verificar variables de entorno
"""
import os
from dotenv import load_dotenv

# Cargar .env si existe
load_dotenv()

print("=" * 60)
print("DIAGNÓSTICO DE VARIABLES DE ENTORNO")
print("=" * 60)

variables = [
    'CORS_ALLOWED_ORIGINS',
    'CSRF_TRUSTED_ORIGINS',
    'ALLOWED_HOSTS',
    'EMAIL_HOST',
    'EMAIL_HOST_USER',
    'EMAIL_HOST_PASSWORD',
    'FRONTEND_URL',
    'DEBUG',
]

for var in variables:
    value = os.getenv(var, 'NO CONFIGURADA')
    # Ocultar contraseñas
    if 'PASSWORD' in var and value != 'NO CONFIGURADA':
        value = '***' + value[-4:] if len(value) > 4 else '****'
    print(f"{var}: {value}")

print("=" * 60)
