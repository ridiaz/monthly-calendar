# Precomputar el modelo del calendario — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la plantilla del calendario itere datos planos precomputados una vez por clic, en vez de llamar métodos del componente en cada ciclo de change detection.

**Architecture:** `generate()` mantiene su flujo actual (fetch de feriados → subscribe). El modelo visual se construye dentro de `renderCalendar(days)` — que es donde `this.holidays` ya está resuelto (éxito) o vacío (error) — produciendo `viewMonths: Array<MonthView>`. La plantilla solo hace `*ngFor` sobre ese modelo.

**Tech Stack:** Angular 4, TypeScript 2.2, date-fns v1. **Sintaxis limitada a TS 2.2** (sin optional chaining `?.` ni nullish coalescing `??`).

**Spec:** `docs/superpowers/specs/2026-11-15-calendar-precompute-design.md`

## Global Constraints

- Solo se modifican `src/app/calendar/calendar.component.ts` y `src/app/calendar/calendar.component.html`.
- La lógica de negocio (`groupByMonth`, `groupByWeek`, `mergeDays`, reglas de color y tooltip) se reutiliza sin cambios; el HTML renderizado debe ser equivalente al actual.
- No tocar `color-coded.directive.ts` ni `calendar.component.css`.
- No actualizar dependencias. No añadir tests nuevos; los specs existentes (creación trivial) deben seguir compilando/pasando.
- El dev server se arranca con `./run-local.sh` (Node 10 local en `.tools/`).

## Review Focus

1. **Celdas vacías** (slots `undefined` de `mergeDays`): deben pintar `label ''` + clase `gray` + tooltip vacío, igual que hoy → verificado en el paso 4 (agosto 2008 empieza en viernes → 5 celdas grises iniciales... en realidad la primera semana de la tabla 2008-08 tiene Sun–Thu vacíos).
2. **Error de la API de feriados**: el calendario se pinta igual sin naranjas ni tooltips, con `Got an error` en consola → es el caso real hoy, verificado en el paso 4.
3. **Éxito de la API de feriados**: no verificable en vivo (API muerta); el camino de código pasa por `getColorOfDay`/`getHolidayName` sin cambios — solo revisión visual del diff.
4. **Rango que cruza de año** (p. ej. 12/1/2008 + 60 días → tablas `2008-12` y `2009-01`, orden de inserción de `Object.keys` como hoy) → verificado en el paso 5.
5. **Segundo clic con valores nuevos**: `viewMonths` se reasigna y el `*ngFor` re-renderiza desde cero → verificado en el paso 5.

---

### Task 1: Precomputar `viewMonths` y reescribir la plantilla

**Files:**
- Modify: `src/app/calendar/calendar.component.ts`
- Modify: `src/app/calendar/calendar.component.html`

**Interfaces:**
- Produces (los consume la plantilla):
  - `interface CalendarCell { label: string; colorClass: string; holidayName: string; }`
  - `interface MonthView { key: string; weeks: Array<Array<CalendarCell>>; }`
  - `CalendarComponent.viewMonths: Array<MonthView>` (inicializado a `[]`)
  - Sigue existiendo `weekDays: Array<any>` para el encabezado.

- [ ] **Step 1: Reescribir `calendar.component.ts`**

Cambios exactos:
- Añadir las dos interfaces `CalendarCell` y `MonthView` (fuera de la clase, tras los imports).
- Añadir el campo `viewMonths: Array<MonthView> = [];` (puede sustituir a `monthKeys`; `months` ya no es campo, queda como variable local dentro de `renderCalendar`).
- Reescribir `renderCalendar(days)` para construir el modelo: para cada `key` de `CalendarComponent.getMonths(groupByMonth(days))`, para cada `weekKey` de `groupByWeek(months[key])`, mapear `mergeDays(daysAgrupados, weekKey)` a `CalendarCell` usando `this.getDate(day)`, `this.getColorOfDay(day)` y `this.getHolidayName(day)` (para `day === undefined` devuelven `''`/`'gray'`/`''` tal como hacen hoy). Asignar el resultado a `this.viewMonths`.
- **Construir el modelo aquí dentro, no en `generate()`**: `renderCalendar` se invoca tras asignar `this.holidays` (éxito) o con `holidays = {}` (error); ese orden es el que garantiza los colores de feriado.
- Eliminar `getWeeksByKey` y `getDays` (solo existían para la plantilla).
- Pasar `getDate`, `getColorOfDay` y `getHolidayName` a `private` (ahora solo se usan internamente).
- Todo lo demás (`generate`, `getHolidays`, `isHoliday`, `mergeDays`, estáticas) queda igual.

- [ ] **Step 2: Reescribir `calendar.component.html`**

El `<form>` queda idéntico. Las tablas pasan a iterar el modelo:

```html
<table *ngFor="let month of viewMonths">
  <tr>
    <td *ngFor="let weekDay of weekDays">{{weekDay}}</td>
  </tr>
  <tr>
    <td colspan="7" style="text-align: center">{{month.key}}</td>
  </tr>
  <tr *ngFor="let week of month.weeks">
    <td appColorCoded [colorClass]="cell.colorClass" *ngFor="let cell of week">
      <label title="{{cell.holidayName}}">{{cell.label}}</label>
    </td>
  </tr>
</table>
```

- [ ] **Step 3: Verificar compilación**

Run: `./run-local.sh` (si el server no está ya corriendo)
Expected: `webpack: Compiled successfully.` sin errores de template ni de TS.

- [ ] **Step 4: Verificar en navegador — equivalencia con el caso conocido**

En Chrome (`http://localhost:4200/`): rellenar `8/15/2008`, `30`, `US` y clic en "Show calendar".
Expected (idéntico al comportamiento previo al cambio): dos tablas (`2008-08` con días 15–31 y su primera semana con celdas grises Sun–Thu; `2008-09` con días 1–14 y una celda gris inicial el domingo), cabeceras `S M T W T F S`, fines de semana amarillos, laborables verdes, sin naranjas; consola con `Got an error` (CORS de holidayapi) y **ningún error nuevo** de Angular.

- [ ] **Step 5: Verificar re-render y cruce de año**

Sin recargar la página, rellenar `12/1/2008`, `60`, `US` y clic de nuevo.
Expected: tablas `2008-12` (1 celda gris inicial, diciembre empieza lunes) y `2009-01`; sin errores en consola. Confirma Review Focus #1, #4 y #5.

- [ ] **Step 6: Commit**

```bash
git add src/app/calendar/calendar.component.ts src/app/calendar/calendar.component.html docs/superpowers
git commit -m "refactor(calendar): precompute view model instead of template method calls"
```
