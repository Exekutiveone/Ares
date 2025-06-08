package Terminal;

import java.util.*;
import org.jline.terminal.Terminal;
import org.jline.terminal.TerminalBuilder;
import org.jline.utils.NonBlockingReader;

class Point3D {
    int x, y, z;
    Point3D(int x, int y, int z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Task {
    Point3D position;
    String type;
    boolean assigned = false;
    boolean completed = false;

    Task(Point3D pos, String type) {
        this.position = pos;
        this.type = type;
    }
}

class Sector {
    int x, y;
    boolean obstacle;
    boolean indoor;
    Task task;
}

class Environment {
    int width, height;
    Sector[][] sectors;

    Environment(int w, int h) {
        width = w;
        height = h;
        sectors = new Sector[w][h];
        for (int i = 0; i < w; i++) {
            for (int j = 0; j < h; j++) {
                sectors[i][j] = new Sector();
                sectors[i][j].x = i;
                sectors[i][j].y = j;
            }
        }
    }

    void ladeVoreingestellteMap(int nr) {
        if (nr == 1) {
            // Beispiel: einfacher Grundriss eines Hausstocks
            for (int i = 0; i < width; i++) {
                sectors[i][0].obstacle = true;
                sectors[i][height - 1].obstacle = true;
            }
            for (int j = 0; j < height; j++) {
                sectors[0][j].obstacle = true;
                sectors[width - 1][j].obstacle = true;
            }
            // Innere Wände
            for (int i = 5; i < 15; i++) {
                sectors[i][10].obstacle = true;
            }
            for (int j = 3; j < 10; j++) {
                sectors[10][j].obstacle = true;
            }
        }
    }

    boolean istKollision(Point3D p) {
        if (p.x < 0 || p.y < 0 || p.x >= width || p.y >= height) return true;
        return sectors[p.x][p.y].obstacle;
    }
}

abstract class Asset {
    String id;
    Point3D position;
    List<Task> taskList = new ArrayList<>();
    int speed;
    boolean assigned;
    String state = "Idle";
    List<Point3D> geplanterPfad = new ArrayList<>();

    abstract void move(Point3D ziel);

    void aktualisierePosition(Point3D ziel) {
        if (position.x < ziel.x) position.x++;
        else if (position.x > ziel.x) position.x--;
        if (position.y < ziel.y) position.y++;
        else if (position.y > ziel.y) position.y--;
    }
}

class Robot extends Asset {
    @Override
    void move(Point3D ziel) {
        aktualisierePosition(ziel);
    }
}

class Drone extends Asset {
    @Override
    void move(Point3D ziel) {
        aktualisierePosition(ziel);
    }
}

class Coordinator {
    Environment env;
    List<Asset> assets;
    List<Task> tasks;

    Coordinator(Environment env, List<Asset> assets, List<Task> tasks) {
        this.env = env;
        this.assets = assets;
        this.tasks = tasks;
    }

    void verteileAufgaben() {
        for (Task task : tasks) {
            if (task.assigned) continue;
            Asset nearest = null;
            int minDist = Integer.MAX_VALUE;
            for (Asset a : assets) {
                int dist = Math.abs(a.position.x - task.position.x) + Math.abs(a.position.y - task.position.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = a;
                }
            }
            if (nearest != null) {
                nearest.taskList.add(task);
                task.assigned = true;
                nearest.assigned = true;
                nearest.geplanterPfad.clear();
                Point3D start = nearest.position;
                Point3D ziel = task.position;
                int x = start.x;
                int y = start.y;
                while (x != ziel.x) {
                    x += (ziel.x > x) ? 1 : -1;
                    nearest.geplanterPfad.add(new Point3D(x, y, 0));
                }
                while (y != ziel.y) {
                    y += (ziel.y > y) ? 1 : -1;
                    nearest.geplanterPfad.add(new Point3D(x, y, 0));
                }
            }
        }
    }

    void simuliere(int steps) {
        for (int t = 0; t < steps; t++) {
            SimulationUI.logStatus(t, env, assets, tasks);
            for (Asset a : assets) {
                if (!a.taskList.isEmpty()) {
                    Task current = a.taskList.get(0);
                    if (!current.completed) {
                        a.move(current.position);
                        if (a.position.x == current.position.x && a.position.y == current.position.y) {
                            current.completed = true;
                            a.state = "Task complete";
                        } else {
                            a.state = "Moving";
                        }
                    }
                }
            }
        }
    }
}

class SimulationUI {
    static void logStatus(int timeStep, Environment env, List<Asset> assets, List<Task> tasks) {
        char[][] grid = new char[env.width][env.height];

        for (int i = 0; i < env.width; i++) {
            for (int j = 0; j < env.height; j++) {
                grid[i][j] = '.';
            }
        }

        for (int i = 0; i < env.width; i++) {
            for (int j = 0; j < env.height; j++) {
                if (env.sectors[i][j].obstacle) grid[i][j] = 'X';
            }
        }

        for (Task t : tasks) {
            if (!t.completed) {
                grid[t.position.x][t.position.y] = 'T';
            }
        }

        for (Asset a : assets) {
            for (Point3D p : a.geplanterPfad) {
                if (grid[p.x][p.y] == '.') {
                    grid[p.x][p.y] = (p.x == a.position.x) ? '|' : '=';
                }
            }
        }

        for (Asset a : assets) {
            grid[a.position.x][a.position.y] = 'A';
        }

        System.out.println("Time Step: " + timeStep);
        for (int j = 0; j < env.height; j++) {
            for (int i = 0; i < env.width; i++) {
                System.out.print(grid[i][j] + " ");
            }
            System.out.println();
        }
        System.out.println();
    }
}

public class Simulation {
    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Wähle Map (z.B. 1):");
        int mapNr = scanner.nextInt();
        scanner.close();

        Environment env = new Environment(20, 20);
        env.ladeVoreingestellteMap(mapNr);

        Robot robot = new Robot();
        robot.id = "R1";
        robot.position = new Point3D(2, 2, 0);
        robot.speed = 1;

        Terminal terminal = TerminalBuilder.terminal();
        terminal.enterRawMode();
        NonBlockingReader reader = terminal.reader();

        System.out.println("Nutze die Pfeiltasten um den Roboter zu bewegen (q zum Beenden).");
        int time = 0;
        while (true) {
            SimulationUI.logStatus(time++, env, Arrays.asList(robot), Collections.emptyList());
            int ch = reader.read();
            if (ch == 'q') break;

            int dx = 0, dy = 0;
            if (ch == 27) {
                int ch2 = reader.read();
                if (ch2 == '[') {
                    int ch3 = reader.read();
                    switch (ch3) {
                        case 'A': dy = -1; break; // up
                        case 'B': dy = 1; break;  // down
                        case 'C': dx = 1; break;  // right
                        case 'D': dx = -1; break; // left
                    }
                }
            }

            Point3D next = new Point3D(robot.position.x + dx, robot.position.y + dy, robot.position.z);
            if (!env.istKollision(next)) {
                robot.position = next;
            }
        }

        terminal.close();
    }
}
