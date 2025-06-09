// maze_editor.js
import { Car } from './car.js'
import { Obstacle } from './Obstacle.js'

const canvas = document.getElementById('canvas')
const ctx    = canvas.getContext('2d')
const bg     = document.getElementById('bgImage')

const CELL_SIZE = 40
const COLS = Math.floor(canvas.width / CELL_SIZE)
const ROWS = Math.floor(canvas.height / CELL_SIZE)
let mode = 'obstacle' // obstacle, target, erase
let obstacles = []
let target = { x: CELL_SIZE*2 + CELL_SIZE/2, y: CELL_SIZE*2 + CELL_SIZE/2, radius: CELL_SIZE/2 }
let car

function drawGrid() {
  ctx.strokeStyle = '#ccc'
  for (let x=0; x<=COLS; x++) {
    ctx.beginPath()
    ctx.moveTo(x*CELL_SIZE, 0)
    ctx.lineTo(x*CELL_SIZE, ROWS*CELL_SIZE)
    ctx.stroke()
  }
  for (let y=0; y<=ROWS; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y*CELL_SIZE)
    ctx.lineTo(COLS*CELL_SIZE, y*CELL_SIZE)
    ctx.stroke()
  }
}

function drawTarget() {
  ctx.fillStyle = 'green'
  ctx.beginPath()
  ctx.arc(target.x, target.y, target.radius, 0, 2*Math.PI)
  ctx.fill()
}

function drawObstacles() {
  for (const o of obstacles) o.draw(ctx)
}

function drawAll() {
  ctx.clearRect(0,0,canvas.width,canvas.height)
  drawGrid()
  drawObstacles()
  drawTarget()
  if (car) car.update(canvas.width, canvas.height)
}

function canvasPos(evt) {
  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((evt.clientX - rect.left)/CELL_SIZE)*CELL_SIZE
  const y = Math.floor((evt.clientY - rect.top)/CELL_SIZE)*CELL_SIZE
  return {x,y}
}

canvas.addEventListener('click', e => {
  const {x,y} = canvasPos(e)
  if (mode === 'obstacle') {
    obstacles.push(new Obstacle(x, y, CELL_SIZE))
  } else if (mode === 'erase') {
    obstacles = obstacles.filter(o => !(o.x===x && o.y===y))
  } else if (mode === 'target') {
    target.x = x + CELL_SIZE/2
    target.y = y + CELL_SIZE/2
  }
  drawAll()
})

document.getElementById('modeObstacle').onclick = () => mode='obstacle'
document.getElementById('modeTarget').onclick = () => mode='target'
document.getElementById('modeErase').onclick = () => mode='erase'

document.getElementById('generateMaze').onclick = () => {
  obstacles = generateMaze(COLS, ROWS)
  drawAll()
}

document.getElementById('startSim').onclick = () => {
  car = new Car(ctx, bg, 0.5, 0, obstacles, { startX: CELL_SIZE, startY: CELL_SIZE })
  drawAll()
  requestAnimationFrame(loop)
}

function loop() {
  drawAll()
  // check target collision
  if (car) {
    const cx = car.posX + car.imgWidth/2
    const cy = car.posY + car.imgHeight/2
    const dx = cx - target.x
    const dy = cy - target.y
    if (Math.sqrt(dx*dx + dy*dy) < target.radius) {
      // respawn
      let tx, ty
      do {
        tx = Math.floor(Math.random()*COLS)*CELL_SIZE + CELL_SIZE/2
        ty = Math.floor(Math.random()*ROWS)*CELL_SIZE + CELL_SIZE/2
      } while (obstacles.some(o =>
         !(tx + 1 < o.x || tx -1 > o.x + o.size || ty + 1 < o.y || ty -1 > o.y + o.size)))
      target.x = tx
      target.y = ty
    }
  }
  requestAnimationFrame(loop)
}

function generateMaze(cols, rows) {
  const maze = Array.from({length: rows}, () => Array(cols).fill(1))
  const stack = []
  const start = {x:1,y:1}
  maze[start.y][start.x] = 0
  stack.push(start)
  const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ]
  while (stack.length) {
    const cur = stack[stack.length-1]
    const neighbors = dirs.map(d=>({x:cur.x+d[0]*2,y:cur.y+d[1]*2}))
      .filter(n=>n.x>0&&n.x<cols-1&&n.y>0&&n.y<rows-1&&maze[n.y][n.x]===1)
    if(neighbors.length){
      const next = neighbors[Math.floor(Math.random()*neighbors.length)]
      maze[next.y][next.x]=0
      maze[cur.y+(next.y-cur.y)/2][cur.x+(next.x-cur.x)/2]=0
      stack.push(next)
    }else{
      stack.pop()
    }
  }
  const obs=[]
  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      if(maze[y][x]===1){
        obs.push(new Obstacle(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE))
      }
    }
  }
  return obs
}

if (bg.complete) drawAll()
else bg.onload = drawAll
