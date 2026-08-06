# Helada Cero

Aplicación web que consulta el pronóstico de temperaturas mínimas de los próximos 7 días para una parcela agrícola de la Región de La Araucanía y marca las noches en que el cultivo queda expuesto a helada.

El usuario registra una parcela (nombre, localidad, tipo de cultivo y umbral crítico en °C) y la interfaz clasifica cada día del pronóstico en cuatro niveles de riesgo —sin riesgo, vigilancia, riesgo y helada— comparando la mínima proyectada contra ese umbral. Además permite dejar un correo electrónico para recibir el aviso de las noches críticas detectadas.

Los datos meteorológicos provienen de la API pública de [Open-Meteo](https://open-meteo.com/), que no requiere clave y publica sus datos bajo licencia CC BY 4.0.

## Tecnologías

- **TypeScript Vanilla** con modo estricto (`strict`, `noUncheckedIndexedAccess`, cero uso de `any`)
- **Vite 5** como servidor de desarrollo y empaquetador
- **Módulos ES nativos** — sin frameworks ni librerías de UI
- **Fetch API** con `async/await` y bloques `try/catch`

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Levantar el servidor de desarrollo en caliente
npm run dev

# Verificar tipos y generar el build de producción
npm run build
```

La aplicación queda disponible en `http://localhost:5173`.

## Estructura del proyecto

```
src/
├── models/          Interfaces y enumeraciones del dominio
│   ├── parcela.ts     Parcela, TipoCultivo, Localidad, coordenadas
│   ├── pronostico.ts  Contrato de la API + modelo de dominio, NivelRiesgo
│   └── estado.ts      EstadoSolicitud (INACTIVO | CARGANDO | EXITO | ERROR), TonoMensaje
├── services/        Comunicación con servicios externos
│   ├── climaService.ts   Consulta a Open-Meteo, timeout de 5 s, validación y mapeo tipado
│   └── alertaService.ts  Envío simulado de la suscripción por correo
├── components/      Funciones puras que generan marcado
│   ├── DiaCard.ts
│   ├── ResumenParcela.ts
│   └── Nevada.ts       Fondo decorativo: cristales de hielo cayendo por la pantalla
├── utils/           Lógica de negocio reutilizable
│   ├── riesgo.ts       Clasificación de riesgo y formato de fechas
│   └── texto.ts        Escapado de HTML para interpolación segura en plantillas
├── main.ts          Captura del DOM, eventos y orquestación asíncrona
└── style.css
```

## Requisitos del Hito 2 y dónde se cumplen

| Pilar | Cómo se cumple |
|---|---|
| **Modelado y tipado de estructuras** | Cuatro enums estrictos (`TipoCultivo`, `Localidad`, `NivelRiesgo`, `EstadoSolicitud`, `TonoMensaje`) e interfaces puras exportadas en [`src/models/`](src/models/). Cero `any` en todo el repositorio; `tsconfig.json` corre con `strict` + `noUncheckedIndexedAccess`. |
| **Renderizado seguro y gestión de eventos** | Todos los nodos del DOM se capturan con `as Tipo \| null` y se validan antes de usarse ([`src/main.ts`](src/main.ts#L52)). Los formularios neutralizan `submit` con `preventDefault()`. Todo texto dinámico que entra a una plantilla HTML pasa por [`escaparHtml`](src/utils/texto.ts) antes de interpolarse. |
| **Arquitectura asíncrona con bloques de control** | `climaService.ts` y `alertaService.ts` usan `async/await` con `try/catch`, validan `response.ok` y aplican un corte de espera de 5 s vía `AbortController` (ver más abajo). `main.ts` inyecta estados visuales de carga, éxito y error en el DOM en cada flujo. |

## Decisiones de diseño

- **Estados con enumeraciones, no con banderas sueltas.** `EstadoSolicitud` reemplaza el clásico par `cargando` / `hayError`. `TonoMensaje` hace lo mismo con el color de los mensajes de retroalimentación: nunca se controla con un `boolean esError` ni con cadenas libres.
- **La respuesta cruda de la API no circula por la aplicación.** `climaService` valida la forma del JSON con una guardia de tipo y la traduce al modelo `DiaPronostico` antes de que nada llegue al DOM.
- **`catch (error: unknown)`.** TypeScript no garantiza que lo lanzado sea un `Error`, así que el tipo se estrecha antes de leer `.message`.
- **Timeout propio en las llamadas de red.** `fetch` no corta la espera por sí solo: si el servidor acepta la conexión y nunca responde, la interfaz queda cargando para siempre. `climaService` corta a los 5 segundos con `AbortController` y muestra "El servidor presenta problemas, vuelve a intentarlo mas tarde".
- **Todo texto dinámico se escapa antes de entrar al DOM.** Los componentes arman marcado con plantillas de cadena; el nombre de la parcela y cualquier otro dato que no sea una constante del código pasan por `escaparHtml` para no ejecutar HTML/JS inyectado por el usuario.
- **La escala de color va de tibio a hielo.** El tablero se enfría visualmente a medida que sube el riesgo, y la helada es el único estado con textura de escarcha.
- **El fondo simula frío: viento, escarcha y nieve cayendo por toda la pantalla.** Es puramente decorativo (`aria-hidden`, `pointer-events: none`) y respeta `prefers-reduced-motion`. Por diseño, el hielo pasa por delante de la cabecera, el formulario y el pie, pero nunca por delante de `.resultados` —el panel con el pronóstico es el único resultado que debe quedar siempre legible.

## Créditos de datos

Datos meteorológicos: [Open-Meteo.com](https://open-meteo.com/) — CC BY 4.0.
