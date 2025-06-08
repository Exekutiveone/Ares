# -*- coding: utf-8 -*-
import RPi.GPIO as GPIO
from flask import Flask, Response
import time

app = Flask(__name__)

# Sonar Sensoren (Trigger, Echo)
SONARS = [
    (22, 10),
    (11, 9),
    (20, 21),
    (12, 16),
    (7, 8)
]

GPIO.setmode(GPIO.BCM)
for trig, echo in SONARS:
    GPIO.setup(trig, GPIO.OUT)
    GPIO.setup(echo, GPIO.IN)

def measure_distance(trig, echo):
    GPIO.output(trig, False)
    time.sleep(0.05)
    GPIO.output(trig, True)
    time.sleep(0.00001)
    GPIO.output(trig, False)

    timeout = time.time() + 0.02
    while GPIO.input(echo) == 0:
        if time.time() > timeout:
            return None
    pulse_start = time.time()

    timeout = time.time() + 0.02
    while GPIO.input(echo) == 1:
        if time.time() > timeout:
            return None
    pulse_end = time.time()

    pulse_duration = pulse_end - pulse_start
    distance_cm = pulse_duration * 17150
    return round(distance_cm, 2)

@app.route('/distance_stream')
def distance_stream():
    def generate():
        while True:
            results = []
            for i, (trig, echo) in enumerate(SONARS):
                dist = measure_distance(trig, echo)
                result = f"Sonar {i+1}: {dist} cm" if dist else f"Sonar {i+1}: No signal"
                results.append(result)
                time.sleep(0.3)
            yield f"data: {' | '.join(results)}\n\n"
    return Response(generate(), mimetype='text/event-stream')

@app.route('/')
def index():
    html = '''
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sonar Distance Stream</title>
      <script>
        var source = new EventSource('/distance_stream');
        source.onmessage = function(event) {
          document.getElementById('distance').textContent = event.data;
        };
      </script>
    </head>
    <body>
      <h1>Ultraschall-Distanzmessung (5 Sensoren)</h1>
      <pre id="distance">waiting...</pre>
    </body>
    </html>
    '''
    return html

@app.route('/cleanup')
def cleanup():
    GPIO.cleanup()
    return "GPIO cleaned up."

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5050)
    finally:
        GPIO.cleanup()
