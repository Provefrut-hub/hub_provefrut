#!/usr/bin/env python
"""
Script para agregar pertenencias de un usuario a múltiples empresas
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hub_core.settings')
django.setup()

from django.contrib.auth.models import User, Group
from core.models import Pertenencia, Empresa

# Configuración
username = input("Ingresa el username del usuario: ")
grupo_nombre = input("Ingresa el nombre del grupo/rol (ej: SISTEMAS_ADMIN): ")

try:
    user = User.objects.get(username=username)
    grupo = Group.objects.get(name=grupo_nombre)
    
    print(f"\n✅ Usuario: {user.username}")
    print(f"✅ Grupo: {grupo.name}")
    
    # Obtener todas las empresas
    empresas = Empresa.objects.all()
    
    print(f"\n📊 Agregando pertenencias a {empresas.count()} empresas:")
    print("-" * 60)
    
    for empresa in empresas:
        # Verificar si ya existe la pertenencia
        pertenencia, created = Pertenencia.objects.get_or_create(
            usuario=user,
            empresa=empresa,
            defaults={'grupo': grupo}
        )
        
        if created:
            print(f"  ✅ CREADA: {empresa.nombre} ({empresa.codigo})")
        else:
            print(f"  ⚠️  YA EXISTE: {empresa.nombre} ({empresa.codigo})")
    
    print("\n" + "=" * 60)
    print("✅ Proceso completado. El usuario ahora tiene acceso a todas las empresas.")
    print("=" * 60)
    
except User.DoesNotExist:
    print(f"\n❌ Usuario '{username}' no encontrado")
except Group.DoesNotExist:
    print(f"\n❌ Grupo '{grupo_nombre}' no encontrado")
    print("\nGrupos disponibles:")
    for g in Group.objects.all():
        print(f"  • {g.name}")
