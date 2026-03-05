#!/usr/bin/env python
"""
Script para gestionar permisos de acceso al módulo de Compras
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hub_core.settings')
django.setup()

from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from core.models import Pertenencia, ModuloCompras

print("\n" + "=" * 70)
print("GESTIÓN DE PERMISOS - MÓDULO DE COMPRAS")
print("=" * 70)

# 1. Verificar que existe el permiso
try:
    content_type = ContentType.objects.get_for_model(ModuloCompras)
    permiso_compras = Permission.objects.get(
        codename='compras_acceso',
        content_type=content_type
    )
    print(f"\n✅ Permiso encontrado: {permiso_compras.codename}")
    print(f"   Nombre: {permiso_compras.name}")
except Permission.DoesNotExist:
    print("\n❌ ERROR: El permiso 'compras_acceso' no existe")
    print("   Verifica que el modelo ModuloCompras esté en core/models.py")
    exit(1)

# 2. Mostrar opciones
print("\n" + "-" * 70)
print("OPCIONES:")
print("  1. Ver usuarios con acceso a Compras")
print("  2. Dar acceso a Compras a un grupo/rol")
print("  3. Dar acceso a Compras a un usuario específico (en una empresa)")
print("  4. Quitar acceso a Compras de un usuario (en una empresa)")
print("-" * 70)

opcion = input("\nSelecciona una opción (1-4): ")

if opcion == "1":
    # Ver usuarios con acceso
    print("\n📊 USUARIOS CON ACCESO A COMPRAS:")
    print("-" * 70)
    
    # Buscar en grupos
    grupos_con_permiso = Group.objects.filter(permissions=permiso_compras)
    print(f"\n🔹 Grupos con permiso ({grupos_con_permiso.count()}):")
    for grupo in grupos_con_permiso:
        print(f"   • {grupo.name}")
        pertenencias = Pertenencia.objects.filter(grupo=grupo)
        for p in pertenencias:
            print(f"     - {p.usuario.username} en {p.empresa.nombre}")
    
    # Buscar pertenencias con permiso adicional
    pertenencias_con_permiso = Pertenencia.objects.filter(permisos_adicionales=permiso_compras)
    print(f"\n🔹 Usuarios con permiso individual ({pertenencias_con_permiso.count()}):")
    for p in pertenencias_con_permiso:
        print(f"   • {p.usuario.username} en {p.empresa.nombre} (Rol: {p.grupo.name})")

elif opcion == "2":
    # Dar acceso a un grupo
    print("\n📋 GRUPOS DISPONIBLES:")
    grupos = Group.objects.all()
    for i, grupo in enumerate(grupos, 1):
        tiene_permiso = permiso_compras in grupo.permissions.all()
        estado = "✅" if tiene_permiso else "❌"
        print(f"   {i}. {grupo.name} {estado}")
    
    grupo_nombre = input("\nIngresa el nombre del grupo: ")
    try:
        grupo = Group.objects.get(name=grupo_nombre)
        grupo.permissions.add(permiso_compras)
        print(f"\n✅ Permiso agregado al grupo '{grupo.name}'")
        print(f"   Todos los usuarios con rol '{grupo.name}' ahora tienen acceso a Compras")
    except Group.DoesNotExist:
        print(f"\n❌ Grupo '{grupo_nombre}' no encontrado")

elif opcion == "3":
    # Dar acceso a un usuario específico
    username = input("\nIngresa el username: ")
    
    try:
        user = User.objects.get(username=username)
        pertenencias = Pertenencia.objects.filter(usuario=user)
        
        print(f"\n📊 Pertenencias de {username}:")
        for i, p in enumerate(pertenencias, 1):
            tiene_permiso = permiso_compras in p.permisos_adicionales.all()
            estado = "✅" if tiene_permiso else "❌"
            print(f"   {i}. {p.empresa.nombre} - {p.grupo.name} {estado}")
        
        empresa_id = input("\nIngresa el ID de la empresa: ")
        pertenencia = Pertenencia.objects.get(usuario=user, empresa_id=empresa_id)
        pertenencia.permisos_adicionales.add(permiso_compras)
        print(f"\n✅ Permiso agregado a {username} en {pertenencia.empresa.nombre}")
        
    except User.DoesNotExist:
        print(f"\n❌ Usuario '{username}' no encontrado")
    except Pertenencia.DoesNotExist:
        print(f"\n❌ El usuario no tiene pertenencia en esa empresa")

elif opcion == "4":
    # Quitar acceso
    username = input("\nIngresa el username: ")
    
    try:
        user = User.objects.get(username=username)
        pertenencias = Pertenencia.objects.filter(usuario=user)
        
        print(f"\n📊 Pertenencias de {username}:")
        for i, p in enumerate(pertenencias, 1):
            tiene_permiso = permiso_compras in p.permisos_adicionales.all()
            estado = "✅" if tiene_permiso else "❌"
            print(f"   {i}. {p.empresa.nombre} - {p.grupo.name} {estado}")
        
        empresa_id = input("\nIngresa el ID de la empresa: ")
        pertenencia = Pertenencia.objects.get(usuario=user, empresa_id=empresa_id)
        pertenencia.permisos_adicionales.remove(permiso_compras)
        print(f"\n✅ Permiso removido de {username} en {pertenencia.empresa.nombre}")
        
    except User.DoesNotExist:
        print(f"\n❌ Usuario '{username}' no encontrado")
    except Pertenencia.DoesNotExist:
        print(f"\n❌ El usuario no tiene pertenencia en esa empresa")

else:
    print("\n❌ Opción inválida")

print("\n" + "=" * 70)
