from flask import Flask, send_from_directory

app = Flask(__name__)

# Ruta para servir el archivo index.html
@app.route('/')
def index():
    return send_from_directory('', 'index.html')

# Ruta para servir archivos estáticos (como imágenes o scripts)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('', filename)

if __name__ == '__main__':
    app.run(debug=True)
