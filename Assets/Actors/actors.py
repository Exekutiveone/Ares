# -*- coding: utf-8 -*-
import RPi.GPIO as GPIO
from flask import Flask, render_template_string, request
import time

app = Flask(__name__)

SERVO_PIN_1 = 17
SERVO_PIN_2 = 27

GPIO.setmode(GPIO.BCM)
GPIO.setup(SERVO_PIN_1, GPIO.OUT)
GPIO.setup(SERVO_PIN_2, GPIO.OUT)

pwm1 = GPIO.PWM(SERVO_PIN_1, 50)
pwm2 = GPIO.PWM(SERVO_PIN_2, 50)
pwm1.start(0)
pwm2.start(0)

def angle_to_duty(angle):
    return 2.5 + (angle / 180.0) * 10  # 0° → 2.5%, 180° → 12.5%

@app.route('/')
def index():
    html = '''
    <html>
    <head>
      <meta charset="utf-8">
      <title>Dual Servo Control</title>
      <style>
        body { background: #111; color: #eee; font-family: monospace; padding: 20px; }
        input, button {
          margin: 10px; padding: 10px; background: #222; color: #fff;
          border: none; border-radius: 4px;
        }
        button:hover { background: #444; }
      </style>
    </head>
    <body>
      <h1>Dual Servo Positioning (0-180&deg;)</h1>
      <form method="POST" action="/rotate">
        <label>Servo 1 Angle (GPIO 17, 0-180):
          <input type="number" name="angle1" min="0" max="180" required>
        </label><br>
        <label>Servo 2 Angle (GPIO 27, 0-180):
          <input type="number" name="angle2" min="0" max="180" required>
        </label><br>
        <button type="submit">Set Positions</button>
      </form>
    </body>
    </html>
    '''
    return render_template_string(html)

@app.route('/rotate', methods=['POST'])
def rotate():
    angle1 = int(request.form.get('angle1', 90))
    angle2 = int(request.form.get('angle2', 90))

    angle1 = max(0, min(180, angle1))
    angle2 = max(0, min(180, angle2))

    duty1 = angle_to_duty(angle1)
    duty2 = angle_to_duty(angle2)

    pwm1.ChangeDutyCycle(duty1)
    pwm2.ChangeDutyCycle(duty2)
    time.sleep(0.5)
    pwm1.ChangeDutyCycle(0)
    pwm2.ChangeDutyCycle(0)

    return index()

@app.route('/cleanup')
def cleanup():
    pwm1.stop()
    pwm2.stop()
    GPIO.cleanup()
    return "GPIO cleaned up."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)