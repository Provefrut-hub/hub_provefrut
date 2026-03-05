#!/usr/bin/env python
"""
Script para verificar las pertenencias de un usuario
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hub_core.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Pertenencia, Empresa

# Solicitar el username
username = input("Ingresa el username del usuario: ")

try:
    user = User.objects.get(username=username)
    print(f"\n✅ Usuario encontrado: {user.username}")
    print(f"   Nombre: {user.first_name} {user.last_name}")
    print(f"   Email: {user.email}")
    
    # Obtener pertenencias
    pertenencias = Pertenencia.objects.filter(usuario=user)
    
    print(f"\n📊 Pertenencias del usuario ({pertenencias.count()}):")
    print("-" * 60)
    
    for p in pertenencias:
        print(f"  • Empresa: {p.empresa.nombre} ({p.empresa.codigo})")
        print(f"    Rol/Grupo: {p.grupo.name}")
        print(f"    ID Empresa: {p.empresa.id}")
        print()
    
    # Mostrar todas las empresas disponibles
    print("\n🏢 Todas las empresas en el sistema:")
    print("-" * 60)
    empresas = Empresa.objects.all()
    for emp in empresas:
        print(f"  • {emp.nombre} ({emp.codigo}) - ID: {emp.id}")
    
    print("\n" + "=" * 60)
    print("Si el usuario debería tener acceso a más empresas,")
    print("necesitas crear registros de Pertenencia en el admin de Django.")
    print("=" * 60)
    
except User.DoesNotExist:
    print(f"\n❌ Usuario '{username}' no encontrado")
