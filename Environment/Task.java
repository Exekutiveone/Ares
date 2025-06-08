package Environment;

import java.util.ArrayList;
import java.util.List;

public class Task {
    public String id;
    public List<Asset> assignedAssets;
    public int priority;
    public List<Coord> coordinates;
    public int estimatedAssets;

    public Task(String id, int priority) {
        this.id = id;
        this.priority = priority;
        this.assignedAssets = new ArrayList<>();
        this.coordinates = new ArrayList<>();
        this.estimatedAssets = 1;
    }
}
