import uuid
from django.test import TestCase
from models import estudiante_model

class EstudianteModelTests(TestCase):
    def test_crear_y_obtener_estudiante(self):
        estudiante_id = str(uuid.uuid4())

        data = {
            'id': estudiante_id,
            'nombre': 'TEST_Juan',
            'apellido_paterno': 'Pérez',
            'apellido_materno': 'Gómez',
            'carrera': 'Ingeniería de Software',
            'ciclo': 3,
            'correo': 'test.juan@example.com',
            'telefono': '999888777',
            'edad': 20,
            'sede': 'Lima Centro',
            'turno': 'diurno',
            'estado_estudiante': 'activo'
        }

        creado = estudiante_model.create(data)
        self.assertIsNotNone(creado)

        obtenido = estudiante_model.get_by_id(estudiante_id)
        self.assertIsNotNone(obtenido)
        self.assertEqual(obtenido['nombre'], 'TEST_Juan')

        estudiante_model.delete(estudiante_id)
