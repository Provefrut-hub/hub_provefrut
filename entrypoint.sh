#!/bin/sh

# Detener la ejecución si un comando falla
set -e

echo "🚀 [BACKEND] Iniciando Entrypoint..."

# 0. Diagnóstico de variables de entorno
echo "🔍 Verificando variables de entorno..."
./venv/bin/python test_env.py

# 1. Migraciones (Usando el Python del entorno virtual)
echo "📦 Aplicando migraciones..."
./venv/bin/python manage.py migrate

# 2. Estáticos
echo "🎨 Recolectando estáticos..."
./venv/bin/python manage.py collectstatic --noinput

# 3. Iniciar Servidor
echo "🔥 Iniciando Gunicorn..."
# IMPORTANTE: Usar 'exec' transfiere el PID 1 a Gunicorn
# Timeout aumentado a 120 segundos para operaciones de correo
exec ./venv/bin/gunicorn hub_core.wsgi:application --bind 0.0.0.0:8000 --timeout 120