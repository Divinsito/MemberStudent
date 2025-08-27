from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from views import (
    index, 
    crear_estudiante, 
    actualizar_estudiante, 
    eliminar_estudiante,
    obtener_estudiante,
    buscar_estudiantes,
    obtener_estadisticas
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name='index'),
    path('api/estudiantes/', crear_estudiante, name='crear_estudiante'),
    path('api/estudiantes/<str:student_id>/', obtener_estudiante, name='obtener_estudiante'),
    path('api/estudiantes/<str:student_id>/update/', actualizar_estudiante, name='actualizar_estudiante'),
    path('api/estudiantes/<str:student_id>/delete/', eliminar_estudiante, name='eliminar_estudiante'),
    path('api/search/', buscar_estudiantes, name='buscar_estudiantes'),
    path('api/estadisticas/', obtener_estadisticas, name='obtener_estadisticas'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)