# Project Conventions

## Workflow
- **NUNCA aplicar cambios de código sin aprobación explícita del usuario.** Aunque el usuario diga "implementa el plan", el flujo correcto es:
  1. Leer y entender el plan.
  2. Si el plan aún no existe como archivo en `features/`, crearlo primero (preguntar al usuario el nombre del archivo).
  3. Presentar el plan al usuario y pedir aprobación explícita antes de tocar cualquier archivo de código.
  4. Solo después de recibir aprobación (e.g. "dale", "aprobado", "sí"), aplicar los cambios.
- Plans must be saved as files in the `features/` directory. Always ask the user what name they want for the plan file before saving it.
- Si el usuario proporciona un plan inline en su mensaje, guardarlo primero en `features/` y luego pedir aprobación para implementar.
