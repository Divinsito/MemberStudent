#                                         🎓 Sistema de Control de Estudiantes

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2-green?logo=django&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)
![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github&logoColor=white)

*Sistema web para la gestión integral de estudiantes desarrollado con metodologías ágiles*

</div>

---

## 📖 Descripción del Proyecto

Sistema web CRUD desarrollado en **Django** para la gestión completa de estudiantes universitarios. Permite administrar información académica incluyendo **nombre, carrera, ciclo académico y correo electrónico**.

### Características Arquitectónicas

- **🏗️ Arquitectura Simplificada**: Estructura Django monolítica optimizada para desarrollo ágil
- **🔗 Integración con Supabase**: Base de datos PostgreSQL en la nube con API REST automática
- **🎨 Interfaz Moderna**: Dashboard responsivo con tema claro/oscuro
- **📊 Dashboard Interactivo**: Estadísticas en tiempo real y visualización de datos
- **🔍 Búsqueda Avanzada**: Filtrado dinámico por múltiples criterios
- **📱 Diseño Responsivo**: Adaptable a dispositivos móviles y tablets

---

## 👥 Equipo de Desarrollo

| 👤 Integrante | 🎯 Rol | 📧 Responsabilidades |
|---------------|---------|---------------------|
| **Alonso Rojas** | Scrum Master | Facilitación de ceremonias, eliminación de impedimentos |
| **Luis Zarayasi** | Product Owner | Definición de requisitos, priorización del backlog |
| **Kassandra Castro** | Frontend Developer | Interfaces de usuario, experiencia del usuario |
| **Diego Saravia** | Backend Developer | Lógica de negocio, modelos de datos |
| **Jared Fernandez** | Backend Developer | APIs, testing, integración |

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Python 3.12+
- pip (gestor de paquetes de Python)
- Git

### Paso a paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu_usuario/control-estudiantes.git
cd control-estudiantes/student-dashboard

# 2. Crear y activar entorno virtual
python -m venv venv

# Activar en Linux/Mac
source venv/bin/activate

# Activar en Windows
venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno (opcional)
# Crear archivo .env con credenciales de Supabase si es necesario

# 5. Ejecutar servidor de desarrollo
python manage.py runserver
```

🌐 **Acceder a la aplicación**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 📁 Estructura del Proyecto

```
student-dashboard/
│
├── 📄 manage.py                   # Script principal de Django
├── 📄 settings.py                # Configuraciones del proyecto
├── 📄 urls.py                    # URLs principales
├── 📄 views.py                   # Vistas y lógica de negocio
├── 📄 models.py                  # Modelos y conexión a Supabase
├── 📄 wsgi.py                    # Configuración WSGI para producción
├── 📄 requirements.txt           # Dependencias del proyecto
│
├── 📂 templates/                 # Plantillas HTML
│   └── 📄 index.html            # Interfaz principal del dashboard
│
├── 📂 static/                    # Archivos estáticos
│   ├── 📂 css/
│   │   └── 📄 styles.css        # Estilos principales
│   └── 📂 js/
│       └── 📄 script.js         # JavaScript funcional
│
└── 📂 .github/                   # Configuración CI/CD
    └── 📂 workflows/
        └── 📄 ci.yml            # Pipeline de integración continua
```

---

## 📝 Historias de Usuario

### Epic: Gestión de Estudiantes

| 🎫 ID | 📋 Historia de Usuario | ✅ Criterios de Aceptación |
|-------|------------------------|---------------------------|
| **HU-001** | Como administrador, quiero **crear** un nuevo estudiante para registrar su información académica | - Formulario con campos: nombre, carrera, ciclo, correo<br>- Validación de datos obligatorios<br>- Mensaje de confirmación |
| **HU-002** | Como usuario, quiero **visualizar** la lista de estudiantes para consultar la información registrada | - Lista paginada de estudiantes<br>- Búsqueda por nombre o carrera<br>- Ordenamiento por diferentes campos |
| **HU-003** | Como administrador, quiero **editar** la información de un estudiante para mantener los datos actualizados | - Formulario pre-rellenado<br>- Validación de cambios<br>- Confirmación de actualización |
| **HU-004** | Como administrador, quiero **eliminar** un estudiante para remover registros innecesarios | - Confirmación antes de eliminar<br>- Eliminación lógica/física<br>- Mensaje de confirmación |


---

## 🧪 Testing y Calidad

### Tipos de Pruebas

```bash
# Ejecutar todas las pruebas
python manage.py test

# Ejecutar pruebas específicas
python manage.py test students.tests

# Generar reporte de cobertura
coverage run --source='.' manage.py test
coverage report
coverage html
```

### 🚀 Integración Continua

**GitHub Actions Pipeline:**
- ✅ Ejecución automática de tests
- 🔍 Análisis de código con SonarCloud
- 📊 Reporte de cobertura
- 🚀 Deploy automático en staging

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: 3.12
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: python manage.py test
```
---

<div align="center">

**🎓 Desarrollado con ❤️ por el Equipo de Control de Estudiantes**

</div>
