# Diseño: precomputar el modelo del calendario (Opción A)

## Intención y por qué
Mejorar el rendimiento del pintado del calendario **como buena práctica** (no hay un caso concreto de lentitud reportado). Hoy la plantilla llama métodos del componente (`getWeeksByKey`, `getDays`, `getDate`, `getColorOfDay`, `getHolidayName`), que Angular re-ejecuta en cada ciclo de change detection; además `groupByWeek()` se recalcula por cada fila. El coste crece de forma cuadrática con el número de días.

## Objetivos
- La plantilla de `CalendarComponent` solo itera datos planos precomputados; ningún método del componente se invoca desde el template.
- El cálculo completo ocurre una sola vez por clic en "Show calendar".

## No-objetivos / anti-objetivos
- **No** cambiar apariencia, layout, colores, tooltips ni comportamiento visible (el HTML renderizado debe ser equivalente).
- **No** cambiar la lógica de negocio: agrupar por mes/semana, alinear columnas, reglas de color (gris hueco, naranja feriado, amarillo fin de semana, verde laborable) se reutilizan tal cual.
- **No** actualizar versiones de Angular ni dependencias, ni arreglar la API de feriados (sigue fallando en silencio como hoy).
- **No** añadir tests nuevos (los specs existentes son triviales de creación y deben seguir pasando).

## Restricciones
- Solo se tocan `src/app/calendar/calendar.component.ts` y `src/app/calendar/calendar.component.html`.
- La directiva `appColorCoded` y `calendar.component.css` quedan intactos.
- Compatible con Angular 4 / TypeScript 2.2 (sin sintaxis moderna posterior a 2017).

## Enfoques considerados
- **A (elegida por el usuario):** precomputar en `generate()` un modelo `viewMonths: Array<{ key, weeks: Array<Array<Cell>> }>` con `Cell = { label, colorClass, holidayName }`. La plantilla itera arrays con `*ngFor`. Elimina el problema de raíz.
- B (descartada): memoizar los métodos del template — mantiene métodos en la plantilla (mala práctica), añade invalidación de caché y los bindings se re-evalúan igual.
- C (descartada): solo `OnPush` — reduce evaluaciones pero cada evaluación recalcula todo; como complemento de A aporta poco porque los datos solo cambian al hacer clic.

## Decisiones
- Las funciones estáticas `groupByMonth`/`groupByWeek` y los helpers `mergeDays`/`getDate`/`getColorOfDay`/`getHolidayName` se reutilizan internamente desde `generate()` para construir el modelo; desaparecen los que solo existían para el template (`getWeeksByKey`, `getDays`).
- Celda vacía (slot `undefined` de `mergeDays`): `label: ''`, `colorClass: 'gray'`, `holidayName: ''` — igual que hoy.
- El encabezado `weekDays` sigue pintándose desde el array del componente.

## Verificación
- `ng serve` compila sin errores.
- En Chrome, con `8/15/2008`, `30` días, `US`: mismo DOM que antes (tablas 2008-08 y 2008-09, mismos días y colores), consola sin errores nuevos (solo el CORS esperado de holidayapi).

## Queda al builder
- Nombres exactos del modelo (`viewMonths`/`Cell` o similar) y detalles menores de estilo.
