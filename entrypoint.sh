#!/bin/sh

# Detener la ejecución si un comando falla
set -e

echo "🚀 [BACKEND] Iniciando Entrypoint..."

# 1. Migraciones (Usando el binario nativo del contenedor)
echo "📦 Aplicando migraciones..."
python manage.py migrate

# 2. Estáticos
echo "🎨 Recolectando estáticos..."
python manage.py collectstatic --noinput

# 3. Iniciar Servidor
echo "🔥 Iniciando Gunicorn..."
# IMPORTANTE: Usar 'exec' transfiere el PID 1 a Gunicorn
exec gunicorn hub_core.wsgi:application --bind 0.0.0.0:8000