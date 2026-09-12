# Puerto 4.0

**Ejercicio Tabletop de Crisis Híbrida Multidominio** para la Diplomatura en Terrorismo e Inteligencia Aplicada.

Simula una crisis coordinada contra una terminal portuaria crítica: ransomware sobre sistemas industriales, operación de desinformación, amenaza con drones, conducción interagencial, atribución, marco jurídico y recuperación.

## Funciones principales

- Configuración del equipo, facilitador e institución.
- Seis roles para el Comité de Crisis.
- Diez hitos y cinco decisiones evaluables.
- Imágenes, videos y música ambiental controlada por el facilitador.
- Registro de fundamentos, hipótesis y disensos.
- Nota final sobre 10 y porcentaje de desempeño.
- Medidor de madurez: Incipiente, Básico, En desarrollo, Avanzado o Estratégico.
- Corrección explicada de cada respuesta no óptima.
- Exportación de evidencia JSON e informe imprimible en PDF.

## Requisitos

- Node.js 22.13 o superior.
- pnpm 10 o superior.
- Git.

## Instalación local

```bash
git clone URL_DE_SU_REPOSITORIO
cd puerto-4-0
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Abrir la dirección local indicada por la terminal, normalmente `http://localhost:3000`.

## Verificación

```bash
pnpm lint
pnpm build
```

Los dos comandos deben terminar sin errores antes de publicar una nueva versión.

## Crear el repositorio en GitHub

1. Ingresar en GitHub y seleccionar **New repository**.
2. Usar como nombre `puerto-4-0-tabletop`.
3. No agregar README, `.gitignore` ni licencia desde GitHub porque ya existen localmente.
4. Copiar la URL HTTPS del repositorio nuevo.
5. Ejecutar desde la carpeta del proyecto:

```bash
git remote add github https://github.com/USUARIO/puerto-4-0-tabletop.git
git push -u github main
```

GitHub ya no acepta la contraseña de la cuenta para operaciones Git por HTTPS. Utilice autenticación del navegador mediante GitHub CLI o un Personal Access Token con el alcance mínimo necesario.

### Alternativa recomendada con GitHub CLI

```bash
gh auth login
gh repo create puerto-4-0-tabletop --private --source=. --remote=github --push
```

Revise que no exista previamente un remoto llamado `github` antes de utilizar el segundo método.

## Estructura esencial

```text
puerto-4-0/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/
├── public/
│   └── media/
├── .openai/hosting.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Seguridad y datos

- No guardar contraseñas, tokens ni credenciales en el repositorio.
- Las decisiones del ejercicio permanecen en la sesión del navegador hasta exportarlas.
- El JSON descargado puede contener nombres del equipo, institución y fundamentos; debe tratarse como evidencia académica.
- Los recursos audiovisuales deben conservar su autorización de uso antes de hacer público el repositorio.

## Licencia

No se declara una licencia abierta por defecto. Antes de publicar el código o los recursos audiovisuales como públicos, defina la licencia del software y verifique los derechos de todas las imágenes, videos y audios.
