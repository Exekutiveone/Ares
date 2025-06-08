package Environment;

public class Asset {
    public String id;
    public String speech;
    public String status;
    public float battery;
    public Task task;
    public Coord position;

    public Asset(String id) {
        this.id = id;
        this.status = "idle";
        this.battery = 100.0f;
        this.speech = "";
        this.position = new Coord(0, 0);
    }

    public void communicate() {
        System.out.println(id + ": " + speech);
    }

    public void move(Coord newPos) {
        this.position = newPos;
        this.status = "moving";
    }
}
