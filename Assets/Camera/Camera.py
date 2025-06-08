# video_server.py
from flask import Flask, Response
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
    return '''
    <html>
    <body style="margin:0">
      <img src="/stream" style="width:100vw;height:auto;">
    </body>
    </html>
    '''

@app.route('/stream')
def stream():
    cmd = [
        'libcamera-vid',
        '-t', '0',
        '--width', '640',
        '--height', '480',
        '--framerate', '15',
        '--codec', 'mjpeg',
        '--inline',
        '--nopreview',
        '-o', '-'
    ]
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE)

    def generate():
        try:
            while True:
                data = process.stdout.read(1024)
                if not data:
                    break
                yield data
        finally:
            process.terminate()

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
