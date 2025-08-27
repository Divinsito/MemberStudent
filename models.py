from supabase import create_client, Client
from django.conf import settings
from typing import List, Dict, Optional
import uuid

class SupabaseClient:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
    
    def get_client(self) -> Client:
        return self.client

supabase_client = SupabaseClient()

class EstudianteModel:
    def __init__(self):
        self.supabase = supabase_client.get_client()
        self.table_name = 'estudiantes'
    
    def get_all(self) -> List[Dict]:
        try:
            response = self.supabase.table(self.table_name).select("*").order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            print(f"Error getting all students: {e}")
            return []
    
    def get_by_id(self, student_id: str) -> Optional[Dict]:
        try:
            response = self.supabase.table(self.table_name).select("*").eq('id', student_id).single().execute()
            return response.data
        except Exception as e:
            print(f"Error getting student by ID: {e}")
            return None
    
    def create(self, data: Dict) -> Optional[Dict]:
        try:
            response = self.supabase.table(self.table_name).insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating student: {e}")
            return None
    
    def update(self, student_id: str, data: Dict) -> Optional[Dict]:
        try:
            response = self.supabase.table(self.table_name).update(data).eq('id', student_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating student: {e}")
            return None
    
    def delete(self, student_id: str) -> bool:
        try:
            self.supabase.table(self.table_name).delete().eq('id', student_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting student: {e}")
            return False
    
    def get_statistics(self) -> Dict:
        try:
            all_students = self.get_all()
            if not all_students:
                return {}
            
            total = len(all_students)
            activos = len([s for s in all_students if s.get('estado_estudiante') == 'activo'])
            
            promedios = [float(s.get('promedio_general', 0)) for s in all_students if s.get('promedio_general')]
            promedio_general = sum(promedios) / len(promedios) if promedios else 0
            
            carreras = {}
            for student in all_students:
                carrera = student.get('carrera', 'Sin carrera')
                carreras[carrera] = carreras.get(carrera, 0) + 1
            
            sedes = {}
            for student in all_students:
                sede = student.get('sede', 'Sin sede')
                sedes[sede] = sedes.get(sede, 0) + 1
            
            return {
                'total_estudiantes': total,
                'estudiantes_activos': activos,
                'promedio_general': round(promedio_general, 2),
                'carreras_populares': sorted(carreras.items(), key=lambda x: x[1], reverse=True)[:5],
                'distribucion_sedes': sedes
            }
        except Exception as e:
            print(f"Error getting statistics: {e}")
            return {}
    
    def search(self, query: str) -> List[Dict]:
        try:
            response = self.supabase.table(self.table_name).select("*").or_(
                f"nombre.ilike.%{query}%,apellido_paterno.ilike.%{query}%,apellido_materno.ilike.%{query}%,carrera.ilike.%{query}%,correo.ilike.%{query}%"
            ).execute()
            return response.data
        except Exception as e:
            print(f"Error searching students: {e}")
            return []

estudiante_model = EstudianteModel()