import csv
import os
from django.contrib.auth.models import User, Group
from django.db import transaction
# AJUSTA EL IMPORT SI ES NECESARIO
from core.models import Empresa, Pertenencia, Area, PerfilUsuario

# ================= CONFIGURACIÓN MAESTRA =================
ARCHIVO_CSV = 'migracion_usuarios.csv'
PASSWORD_DEFAULT = "Temporal123*"

# IDs FIJOS recuperados de tu base de datos:
ID_GRUPO_BASE = 4    # "USUARIO_BASE"
ID_AREA_GENERAL = 2  # "General"

# Mapeo: Código CSV -> ID (PK) real de la tabla core_empresa
MAPA_EMPRESAS_IDS = {
    '182': 1,  # Provefrut
    '222': 2,  # Nintanga
    '192': 3   # Procongelados
}
# =========================================================

def ejecutar_carga_final():
    print(f"--- INICIANDO CARGA DE USUARIOS DESDE {ARCHIVO_CSV} ---")
    
    if not os.path.exists(ARCHIVO_CSV):
        print(f"❌ ERROR: No encuentro el archivo {ARCHIVO_CSV}. Súbelo a la raíz.")
        return

    cont_ok = 0
    cont_skip = 0
    cont_error = 0

    try:
        with open(ARCHIVO_CSV, mode='r', encoding='utf-8-sig') as csv_file:
            # CORRECCIÓN AQUÍ: Usamos delimiter=';'
            lector = csv.DictReader(csv_file, delimiter=';')
            
            # Verificación rápida de cabeceras
            headers = lector.fieldnames
            print(f"ℹ️ Cabeceras detectadas: {headers}")
            
            # Verificamos si al menos existe la columna 'usuario'
            if not headers or 'usuario' not in headers:
                print("❌ ERROR DE CABECERAS: No encuentro la columna 'usuario'.")
                print("Asegúrate de que la primera línea del Excel sea exactamente:")
                print("usuario;nombre_completo;codigo_empresa;email")
                return

            for fila in lector:
                try:
                    # 1. Extracción y Limpieza
                    # Accedemos con los nombres exactos del CSV
                    username = fila['usuario'].strip().lower()
                    nombre_completo = fila['nombre_completo'].strip()
                    cod_empresa_csv = str(fila['codigo_empresa']).strip()
                    email = fila['email'].strip()

                    # Validación de Empresa
                    empresa_id_real = MAPA_EMPRESAS_IDS.get(cod_empresa_csv)
                    if not empresa_id_real:
                        print(f"⚠️ ALERTA: Empresa '{cod_empresa_csv}' no válida para {username}. Saltando.")
                        cont_error += 1
                        continue

                    # Tratamiento de Email vacío
                    if not email:
                        email = f"{username}@sin_correo.local"

                    # 2. Transacción Atómica (Todo o Nada)
                    with transaction.atomic():
                        # A. Evitar duplicados
                        if User.objects.filter(username=username).exists():
                            print(f"⏩ SKIP: {username} ya existe.")
                            cont_skip += 1
                            continue

                        # B. Separar Nombres
                        partes = nombre_completo.split(' ', 1)
                        first_name = partes[0]
                        last_name = partes[1] if len(partes) > 1 else ''

                        # C. Crear Usuario Django
                        user = User.objects.create_user(
                            username=username,
                            email=email,
                            password=PASSWORD_DEFAULT,
                            first_name=first_name,
                            last_name=last_name,
                            is_active=True
                        )

                        # D. Crear/Asegurar Perfil (Forzar cambio de clave)
                        PerfilUsuario.objects.update_or_create(
                            usuario=user,
                            defaults={'debe_cambiar_password': True}
                        )

                        # E. Crear Pertenencia
                        Pertenencia.objects.create(
                            usuario=user,
                            empresa_id=empresa_id_real,
                            grupo_id=ID_GRUPO_BASE,
                            area_id=ID_AREA_GENERAL
                        )
                        
                        print(f"✅ CREADO: {username} -> Empresa {cod_empresa_csv}")
                        cont_ok += 1

                except Exception as e:
                    print(f"❌ ERROR en fila {fila}: {str(e)}")
                    cont_error += 1

    except Exception as e_gral:
        print(f"❌ ERROR DE LECTURA DE ARCHIVO: {e_gral}")

    print("="*40)
    print(f"RESUMEN FINAL:")
    print(f"✅ Exitosos: {cont_ok}")
    print(f"⏩ Saltados: {cont_skip}")
    print(f"❌ Errores:  {cont_error}")
    print("="*40)

ejecutar_carga_final()