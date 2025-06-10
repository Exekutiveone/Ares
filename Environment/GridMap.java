package Environment;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class GridMap {
    public int width;
    public int height;
    public int[][] gridArray;
    public List<Asset> assets;
    public List<Coord> obstacles;
    public List<Coord> targets;
    private final Random rand = new Random();

    public GridMap(int width, int height) {
        this.width = width;
        this.height = height;
        this.gridArray = new int[height][width];
        this.assets = new ArrayList<>();
        this.obstacles = new ArrayList<>();
        this.targets = new ArrayList<>();
    }

    public boolean inBounds(Coord c) {
        return c.x >= 0 && c.x < width && c.y >= 0 && c.y < height;
    }

    public boolean isFree(Coord c) {
        return inBounds(c) && gridArray[c.y][c.x] == 0;
    }

    public void addObstacle(Coord c) {
        if (isFree(c)) {
            obstacles.add(c);
            gridArray[c.y][c.x] = 1;
        }
    }

    public void addTarget(Coord c) {
        if (isFree(c)) {
            targets.add(c);
            gridArray[c.y][c.x] = 2;
        }
    }

    /**
     * Place a target at a random free coordinate on the map.
     * @return the coordinate of the placed target or null if no free spot was found
     */
    public Coord placeRandomTarget() {
        int attempts = width * height * 2;
        while (attempts-- > 0) {
            Coord c = new Coord(rand.nextInt(width), rand.nextInt(height));
            if (isFree(c)) {
                addTarget(c);
                return c;
            }
        }
        return null;
    }

    public void addAsset(Asset asset, Coord c) {
        if (isFree(c)) {
            asset.position = c;
            assets.add(asset);
        }
    }
}
