import numpy as np
import matplotlib.pyplot as plt

g = 9.81  # gravedad en m/s^2
v0 = 20   # velocidad inicial en m/s
x = 35    # distancia al catcher en m
y0 = 2    # altura inicial en m
yf = 1    # altura final en m

def trayectoria(theta):
    """
    Función que modela la trayectoria de la pelota.
    Queremos encontrar theta donde f(theta) = 0
    """
    theta_rad = np.radians(theta)
    return y0 + x * np.tan(theta_rad) - (g * x**2) / (2 * v0**2 * np.cos(theta_rad)**2) - yf

def biseccion(f, a, b, tol=1e-6, max_iter=100):
    """Método de bisección para encontrar la raíz de la función f"""
    iteraciones = []
    errores = []
    for i in range(max_iter):
        c = (a + b) / 2
        error = abs(f(c))
        iteraciones.append(i+1)
        errores.append(error)
        if error < tol:
            break
        if f(a) * f(c) < 0:
            b = c
        else:
            a = c
    return c, iteraciones, errores

def falsa_posicion(f, a, b, tol=1e-6, max_iter=100):
    """Método de falsa posición para encontrar la raíz de la función f"""
    iteraciones = []
    errores = []
    for i in range(max_iter):
        c = b - f(b) * (b - a) / (f(b) - f(a))
        error = abs(f(c))
        iteraciones.append(i+1)
        errores.append(error)
        if error < tol:
            break
        if f(a) * f(c) < 0:
            b = c
        else:
            a = c
    return c, iteraciones, errores




# Intervalo de búsqueda para theta (0° a 90°)
a, b = 10, 80

# Resolver con Bisección
theta_biseccion, it_biseccion, err_biseccion = biseccion(trayectoria, a, b)

# Resolver con Falsa Posición
theta_fp, it_fp, err_fp = falsa_posicion(trayectoria, a, b)

# Mostrar resultados
print(f"Ángulo estimado con Bisección: {theta_biseccion:.4f}°")
print(f"Ángulo estimado con Falsa Posición: {theta_fp:.4f}°")

# Graficar errores vs iteraciones
plt.figure(figsize=(10, 5))
plt.plot(it_biseccion, err_biseccion, 'bo-', label='Bisección')
plt.plot(it_fp, err_fp, 'ro-', label='Falsa Posición')
plt.xlabel('Iteraciones')
plt.ylabel('Error Absoluto')
plt.yscale('log')  # Escala logarítmica para visualizar mejor
plt.title('Error vs Iteraciones')
plt.legend()
plt.grid()
plt.show()
