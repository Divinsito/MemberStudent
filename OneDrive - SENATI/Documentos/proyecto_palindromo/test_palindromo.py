import unittest
from palindromo import es_palindromo

#TERMINAL
# cd "C:\Users\LENOVO\OneDrive - SENATI\Documentos\proyecto_palindromo"
# pytest -v test_palindromo.py


class TestPalindromo(unittest.TestCase):

    def test_palabra_palindroma_simple(self):
        """Test: palabra palíndroma simple en minúsculas"""
        self.assertTrue(es_palindromo("reconocer"))

    def test_palabra_no_palindroma(self):
        """Test: palabra que no es palíndroma"""
        self.assertFalse(es_palindromo("Hola"))

    def test_palabra_palindroma_con_mayusculas(self):
        """Test: palíndromo con mayúsculas y minúsculas mezcladas"""
        self.assertTrue(es_palindromo("Anita lava la tina"))

    def test_frase_palindroma_con_espacios(self):
        """Test: frase palíndroma con espacios"""
        self.assertTrue(es_palindromo("A man a plan a canal Panama"))

    def test_cadena_vacia(self):
        """Test: cadena vacía debe ser palíndroma"""
        self.assertTrue(es_palindromo(""))

    def test_una_sola_letra(self):
        """Test: una sola letra es palíndroma"""
        self.assertTrue(es_palindromo("a"))


