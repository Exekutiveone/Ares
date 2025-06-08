import java.util.*;

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

    abstract void move(Point3D ziel);

    void aktualisierePosition(Point3D ziel) {
        if (position.x < ziel.x) position.x++;
        else if (position.x > ziel.x) position.x--;
        if (position.y < ziel.y) position.y++;
        else if (position.y > ziel.y) position.y--;
        // adjust z position as well
        if (position.z < ziel.z) position.z++;
        else if (position.z > ziel.z) position.z--;
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
        aktualisierePosition(ziel); // kann z auch anpassen
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
            }
        }
    }

    void simuliere(int steps) {
        for (int t = 0; t < steps; t++) {
            for (Asset a : assets) {
                if (!a.taskList.isEmpty()) {
                    Task current = a.taskList.get(0);
                    if (!current.completed) {
                        a.move(current.position);
                        if (a.position.x == current.position.x && a.position.y == current.position.y && a.position.z == current.position.z) {
                            current.completed = true;
                            a.state = "Task complete";
                        } else {
                            a.state = "Moving";
                        }
                    }
                }
            }
            SimulationUI.logStatus(t, assets);
        }
    }
}

class SimulationUI {
    static void logStatus(int timeStep, List<Asset> assets) {
        System.out.println("Time Step: " + timeStep);
        for (Asset a : assets) {
            System.out.printf("Asset %s at (%d,%d,%d) State: %s\n",
                a.id, a.position.x, a.position.y, a.position.z, a.state);
        }
        System.out.println();
    }
}

public class Simulation {
    public static void main(String[] args) {
        Environment env = new Environment(20, 20);

        Robot robot = new Robot();
        robot.id = "R1";
        robot.position = new Point3D(2, 2, 0);
        robot.speed = 1;

        Task task = new Task(new Point3D(10, 10, 0), "inspect");

        List<Asset> assets = Arrays.asList(robot);
        List<Task> tasks = Arrays.asList(task);

        Coordinator coordinator = new Coordinator(env, assets, tasks);
        coordinator.verteileAufgaben();
        coordinator.simuliere(20);
    }
}
