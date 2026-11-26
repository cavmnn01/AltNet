# Bitacora Criterio 2 - Arquitectura de Software

Proyecto: **AltNet / ONT Provisioning**  
Repositorio: https://github.com/cavmnn01/AltNet  
Fecha de cierre: 2026-11-25

## Alcance y estado de trazabilidad

Este registro relaciona la implementación disponible en el repositorio con los casos de uso, restricciones y escenarios de calidad definidos en las entregas C1 Parte 1 y C1 Parte 2.

La trazabilidad se basa en el resultado real de `git log --date=short --pretty=format:"%h | %ad | %s"`. En el historial activo de la rama `main` existe un unico commit del proyecto:

```text
73cad60 | 2026-11-25 | Implementacion de flujos principales del proyecto
```


## Registro de cambios

| Fecha real | Commit | Incremento | Drivers atendidos | Archivos o componentes | Verificacion y resultado | Pendientes |
|---|---|---|---|---|---|---|
| 2026-11-25 | `73cad60` | Implementacion funcional inicial | CU-01 Aprovisionamiento de ONT nueva mediante OCR; CU-02 Reemplazo seguro; CU-03 Auditoria; R-01; R-02; R-03; QA-01 a QA-06 | `src/`, `frontend/`, `tests/`, `Dockerfile`, `compose.yaml`, `README.md`, `package.json` | Commit inicial real. El repositorio contiene backend Express, persistencia PostgreSQL con Drizzle, OLT simulada, interfaz React y 6 pruebas Vitest declaradas. | OCR real, integracion CRM real, swap completo, autorizacion temporal obligatoria, auditoria append-only y mediciones cuantitativas de calidad. |
| 2026-11-25 | Sin commit | Contrato API OpenAPI 3.1 | CU-01; CU-02; QA-01; QA-02; QA-06 | `openapi.json`, `src/app.js`, `README.md` | Documento JSON validado sintacticamente; contiene 5 endpoints. Ruta `/api/openapi.json` registrada. Resultado de `npm test`: 2 archivos aprobados y 6 pruebas aprobadas. | Validar el contrato contra Swagger/OpenAPI Validator, documentar ejemplos y publicar mediante Swagger UI si se considera necesario. |
| 2026-11-25 | Sin commit | Revision final de implementacion y documentacion | CU-01, CU-02, CU-03, R-01, R-02, R-03, QA-01 a QA-06 | `README.md`, `docs/bitacora.md`, `openapi.json`, `src/`, `tests/` | Se verifico el historial real de Git y el resultado ejecutable de Vitest. No se afirmaron aprobaciones de QA que no tengan pruebas existentes. | Ejecutar Docker Compose, probar endpoints manualmente, implementar pendientes funcionales y completar mediciones de calidad. |

## Estado actual por caso de uso

| Caso de uso | Estado implementado | Evidencia o limitacion |
|---|---|---|
| CU-01 Aprovisionamiento de ONT nueva | Parcial | Existen autenticacion, consulta de perfiles, descubrimiento de ONT y autorizacion. El OCR no esta implementado; el serial se envia manualmente. Falta validar la OT vigente obligatoria. |
| CU-02 Reemplazo seguro con ticket aprobado | No implementado | El modelo permite recibir `workOrderId`, pero no existe un flujo de swap ni baja de una ONT anterior en la interfaz ni el servicio. |
| CU-03 Auditoria inmutable | Parcial | Se escribe una bitacora de provisioning, pero no existe una politica de tabla append-only ni controles de UPDATE/DELETE a nivel de base de datos. |

## Estado actual por restriccion o regla

| ID | Enunciado | Estado | Evidencia |
|---|---|---|---|
| R-01 | Autorizacion temporal estricta por OT del dia | No acreditado | El trabajo opcional de `workOrderId` consulta disponibilidad, pero no integra un CRM ni fuerza una OT vigente del dia. |
| R-02 | Filtrado por expresiones regulares de fabricantes | Verificacion parcial | El dominio normaliza y valida seriales mediante Zod y expresiones regulares de formatos generales. No existe configuracion centralizada ni soporte completo por fabricante. |
| R-03 | Procesamiento OCR local en el dispositivo | No implementado | No se hallo OCR ni procesamiento de imagen local en el frontend. |

## Trazabilidad de escenarios de calidad

| Driver | Implementacion o evidencia disponible | Alcance real de validacion | Pendiente |
|---|---|---|---|
| QA-01 Seguridad - autorizacion y no repudio | Validacion de perfil, permiso por rol y creacion de logs mediante el servicio de provisioning. | La prueba automatizada rechaza perfiles invalidos y potencias Rx inferiores al minimo; no se realizan 100 solicitudes invalidas ni se valida una OT real. | Verificar OT vigente del dia, 403 antes de OLT, auditoria append-only y 100 pruebas invalidas. |
| QA-02 Seguridad - credenciales de infraestructura | JWT en el backend, credenciales OLT fuera del cliente y variables de entorno. | No se realizo auditoria OWASP ZAP ni inspeccion automatizada del bundle. | Revisar static bundle, trafico TLS, revocacion de sesion y proteccion de secretos. |
| QA-03 Desempeno - OCR en borde | No existe OCR local. | No se midio p95 ni consumo de memoria en dispositivos reales. | Implementar OCR, medir al menos 50 capturas y acreditar p95 <= 3,0 s y memoria adicional < 150 MB. |
| QA-04 Usabilidad - correccion rapida | La interfaz React puede ofrecer un flujo posterior de confirmacion, pero no se implemento OCR ni edicion asistida. | No se realizaron pruebas controladas con etiquetas degradadas. | Alcanzar al menos 95% de correccion y envio en <= 10 s y <= 2 intentos. |
| QA-05 Disponibilidad - intermitencia de red | El frontend usa una aplicacion compilada con Docker/Nginx, pero no se confirmo Service Worker ni cola offline. | No se probaron cortes de red ni reconexion. | Implementar cola cifrada, reintentos con backoff y prueba de 15 minutos sin perdida. |
| QA-06 Modificabilidad - nuevos modelos ONT | Arquitectura por servicios, repositorio y adaptador OLT separa responsabilidades. | No se realizo un cambio controlado con un nuevo fabricante. | Configurar patrones RegEx y perfiles por fabricante sin afectar modulos existentes; acreditar <= 4 horas y <= 2 modulos. |

## Verificacion ejecutada

Comando ejecutado:

```powershell
npm test
```

Resultado real:

```text
Test Files  2 passed (2)
Tests       6 passed (6)
```

Se ejecutaron tambien comprobaciones sintacticas del contrato OpenAPI:

```text
OpenAPI JSON valido: 5 endpoints
```

No se completaron pruebas Docker/PostgreSQL, pruebas HTTP en Postman y benchmarks de calidad. Estas verificaciones no se presentan como aprobadas.

## Pendientes y mejoras futuras

- Integrar el CRM/ERP real y bloquear aprovisionamientos sin una OT vigente del dia.
- Implementar el flujo CU-02 de swap seguro con ticket aprobado.
- Implementar OCR local en la PWA y validar seriales de los fabricantes soportados.
- Convertir la bitacora de provisionamiento en auditoria inmutable con INSERT-only.
- Agregar Service Worker, cola local cifrada y sincronizacion offline.
- Ejecutar las pruebas de carga, concurrencia, seguridad y usabilidad propuestas en C1 Parte 2.
- Medir p95, consumo de memoria, disponibilidad, latencia de revocacion y tiempo de modificabilidad.
- Publicar una UI de Swagger u otro visualizador del contrato OpenAPI.
- Confirmar el rango optico final con Ingenieria de Planta Externa.
- No incluir secretos reales, datos personales ni claves en el repositorio ni en evidencias.
