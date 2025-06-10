export function aStar(start, goal, cols, rows, obstacles, cellSize) {
  const toKey = (x, y) => `${x},${y}`
  const fromKey = k => k.split(',').map(n => parseInt(n, 10))
  const blocked = new Set()
  for (const o of obstacles) {
    const ox = o.x / cellSize
    const oy = o.y / cellSize
    const size = Math.ceil(o.size / cellSize)
    for (let dx = 0; dx < size; dx++) {
      for (let dy = 0; dy < size; dy++) {
        blocked.add(toKey(ox + dx, oy + dy))
      }
    }
  }
  const startKey = toKey(start.x, start.y)
  const goalKey = toKey(goal.x, goal.y)
  const open = [startKey]
  const openSet = new Set(open)
  const came = {}
  const g = { [startKey]: 0 }
  const f = { [startKey]: Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y) }
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]]
  while (open.length) {
    open.sort((a,b) => f[a]-f[b])
    const current = open.shift()
    openSet.delete(current)
    if (current === goalKey) {
      const path = []
      let ck = current
      while (ck) {
        const [cx, cy] = fromKey(ck)
        path.push({x: cx, y: cy})
        ck = came[ck]
      }
      return path.reverse()
    }
    const [cx, cy] = fromKey(current)
    for (const [dx,dy] of dirs) {
      const nx = cx+dx
      const ny = cy+dy
      const nk = toKey(nx, ny)
      if (nx<0 || ny<0 || nx>=cols || ny>=rows) continue
      if (blocked.has(nk)) continue
      const tentative = g[current] + 1
      if (!(nk in g) || tentative < g[nk]) {
        came[nk] = current
        g[nk] = tentative
        f[nk] = tentative + Math.abs(goal.x - nx) + Math.abs(goal.y - ny)
        if (!openSet.has(nk)) { open.push(nk); openSet.add(nk) }
      }
    }
  }
  return null
}
