package Environment;

import java.util.Arrays;

public class Simulation {
    public static void main(String[] args) {
        GridMap map = new GridMap(10, 10);

        Asset robot = new Asset("R1");
        map.addAsset(robot, new Coord(2, 2));

        map.addObstacle(new Coord(5, 5));
        map.addTarget(new Coord(7, 7));

        Task task = new Task("T1", 1);
        task.coordinates.addAll(Arrays.asList(new Coord(7, 7)));
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
