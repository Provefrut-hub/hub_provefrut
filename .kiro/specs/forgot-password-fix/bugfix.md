# Bugfix Requirements Document

## Introducción

El botón "¿Olvidaste tu contraseña?" en la página de login no funciona debido a un error de CORS (Cross-Origin Resource Sharing) que bloquea las peticiones desde el frontend en Amplify (https://main.d2n6dprtfytcex.amplifyapp.com) hacia el backend en AWS App Runner (https://pazypzwcqf.us-east-1.awsapprunner.com/api/). 

El error específico es: "Access to XMLHttpRequest at 'https://pazypzwcqf.us-east-1.awsapprunner.com/api/password-reset/' from origin 'https://main.d2n6dprtfytcex.amplifyapp.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource."

Esto impide que los usuarios puedan solicitar el restablecimiento de su contraseña, mostrando el mensaje genérico "Ocurrió un problema al procesar tu solicitud. Inténtalo más tarde."

## Bug Analysis

### Current Behavior (Defect)

1.1 CUANDO un usuario hace clic en "¿Olvidaste tu contraseña?" y envía su correo electrónico desde el frontend en Amplify ENTONCES el navegador bloquea la petición POST a '/api/password-reset/' con error CORS "No 'Access-Control-Allow-Origin' header is present"

1.2 CUANDO el navegador bloquea la petición por CORS ENTONCES el usuario ve el mensaje de error "Ocurrió un problema al procesar tu solicitud. Inténtalo más tarde." sin recibir el enlace de recuperación

1.3 CUANDO se realiza una petición OPTIONS (preflight) al endpoint '/api/password-reset/' ENTONCES el backend no responde con los headers CORS necesarios para permitir el origen de Amplify

### Expected Behavior (Correct)

2.1 CUANDO un usuario hace clic en "¿Olvidaste tu contraseña?" y envía su correo electrónico desde el frontend en Amplify ENTONCES el backend DEBERÁ responder con el header 'Access-Control-Allow-Origin' permitiendo el origen 'https://main.d2n6dprtfytcex.amplifyapp.com'

2.2 CUANDO el backend procesa exitosamente la solicitud de restablecimiento ENTONCES el usuario DEBERÁ ver el mensaje "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación en breve." y recibir el correo electrónico

2.3 CUANDO se realiza una petición OPTIONS (preflight) al endpoint '/api/password-reset/' ENTONCES el backend DEBERÁ responder con los headers CORS apropiados (Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers)

### Unchanged Behavior (Regression Prevention)

3.1 CUANDO un usuario accede a otros endpoints de la API (login, select-empresa, mis-empresas, etc.) ENTONCES el sistema DEBERÁ CONTINUAR funcionando correctamente con las configuraciones CORS existentes

3.2 CUANDO un usuario utiliza la funcionalidad de login desde el frontend en Amplify ENTONCES el sistema DEBERÁ CONTINUAR autenticando correctamente sin errores CORS

3.3 CUANDO un usuario ya autenticado navega por el dashboard y otras páginas protegidas ENTONCES el sistema DEBERÁ CONTINUAR funcionando sin errores CORS en las peticiones API

3.4 CUANDO se realizan peticiones desde entornos de desarrollo local (localhost) ENTONCES el sistema DEBERÁ CONTINUAR permitiendo estas peticiones según la configuración CORS existente
