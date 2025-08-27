from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from models import estudiante_model
import json
import uuid

def index(request):
    estudiantes = estudiante_model.get_all()
    estadisticas = estudiante_model.get_statistics()
    
    context = {
        'estudiantes': estudiantes,
        'estadisticas': estadisticas,
        'total_estudiantes': len(estudiantes)
    }
    return render(request, 'index.html', context)

@csrf_exempt
@require_http_methods(["POST"])
def crear_estudiante(request):
    try:
        data = json.loads(request.body)
        
        nuevo_estudiante = {
            'nombre': data.get('nombre'),
            'apellido_paterno': data.get('apellido_paterno'),
            'apellido_materno': data.get('apellido_materno', ''),
            'carrera': data.get('carrera'),
            'ciclo': int(data.get('ciclo')),
            'correo': data.get('correo'),
            'telefono': data.get('telefono', ''),
            'edad': int(data.get('edad', 18)),
            'sede': data.get('sede', 'Lima Centro'),
            'turno': data.get('turno', 'diurno'),
            'estado_estudiante': 'activo'
        }
        
        resultado = estudiante_model.create(nuevo_estudiante)
        
        if resultado:
            return JsonResponse({
                'success': True,
                'message': 'Estudiante creado exitosamente',
                'data': resultado
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Error al crear el estudiante'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def actualizar_estudiante(request, student_id):
    try:
        data = json.loads(request.body)
        
        datos_actualizacion = {
            'nombre': data.get('nombre'),
            'apellido_paterno': data.get('apellido_paterno'),
            'apellido_materno': data.get('apellido_materno', ''),
            'carrera': data.get('carrera'),
            'ciclo': int(data.get('ciclo')),
            'correo': data.get('correo'),
            'telefono': data.get('telefono', ''),
            'edad': int(data.get('edad', 18)),
            'sede': data.get('sede'),
            'turno': data.get('turno'),
            'estado_estudiante': data.get('estado_estudiante', 'activo')
        }
        
        resultado = estudiante_model.update(student_id, datos_actualizacion)
        
        if resultado:
            return JsonResponse({
                'success': True,
                'message': 'Estudiante actualizado exitosamente',
                'data': resultado
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Error al actualizar el estudiante'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def eliminar_estudiante(request, student_id):
    try:
        resultado = estudiante_model.delete(student_id)
        
        if resultado:
            return JsonResponse({
                'success': True,
                'message': 'Estudiante eliminado exitosamente'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Error al eliminar el estudiante'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=500)

@require_http_methods(["GET"])
def obtener_estudiante(request, student_id):
    try:
        estudiante = estudiante_model.get_by_id(student_id)
        
        if estudiante:
            return JsonResponse({
                'success': True,
                'data': estudiante
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Estudiante no encontrado'
            }, status=404)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=500)

@require_http_methods(["GET"])
def buscar_estudiantes(request):
    try:
        query = request.GET.get('q', '')
        if query:
            estudiantes = estudiante_model.search(query)
        else:
            estudiantes = estudiante_model.get_all()
        
        return JsonResponse({
            'success': True,
            'data': estudiantes,
            'total': len(estudiantes)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=500)

@require_http_methods(["GET"])
def obtener_estadisticas(request):
    try:
        estadisticas = estudiante_model.get_statistics()
        return JsonResponse({
            'success': True,
            'data': estadisticas
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=500)