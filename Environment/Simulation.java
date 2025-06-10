package Environment;

import java.util.Arrays;

public class Simulation {
    public static void main(String[] args) {
        GridMap map = new GridMap(10, 10);

        Asset robot = new Asset("R1");
        map.addAsset(robot, new Coord(2, 2));

        map.addObstacle(new Coord(5, 5));
        Coord target = map.placeRandomTarget();

        Task task = new Task("T1", 1);
        if (target != null) {
            task.coordinates.addAll(Arrays.asList(target));
        }
        robot.task = task;
        task.assignedAssets.add(robot);

        System.out.println("Initial position: " + robot.position);
        for (Coord step : task.coordinates) {
            if (map.isFree(step)) {
                robot.move(step);
                System.out.println("Moved to " + robot.position);
            }
        }

        robot.communicate();
        System.out.println("Targets on map: " + map.targets.size());
    }
}
