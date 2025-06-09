package Transmitter;

import java.sql.*;
import java.util.UUID;

public class DBTestInsert {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://192.168.178.147:5432/ares";
        String user = "ares";
        String password = "ares";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Verbindung erfolgreich.");

            // Beispiel 1: Asset anlegen
            UUID assetId = UUID.randomUUID();
            String insertAsset = "INSERT INTO assets (id, name, type, status, battery) VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insertAsset)) {
                ps.setObject(1, assetId);
                ps.setString(2, "Scout-01");
                ps.setString(3, "ground");
                ps.setString(4, "idle");
                ps.setFloat(5, 97.5f);
                ps.executeUpdate();
                System.out.println("Asset eingefügt.");
            }

            // Beispiel 2: Component hinzufügen
            String insertComponent = "INSERT INTO asset_components (asset_id, type, model, position, data) VALUES (?, ?, ?, ?, ?::jsonb)";
            try (PreparedStatement ps = conn.prepareStatement(insertComponent)) {
                ps.setObject(1, assetId);
                ps.setString(2, "sensor");
                ps.setString(3, "Ultrasonic-X");
                ps.setString(4, "front");
                ps.setString(5, "{\"range\": \"0-4m\", \"angle\": \"120\u00b0\"}");
                ps.executeUpdate();
                System.out.println("Component eingefügt.");
            }

            // Beispiel 3: Task anlegen
            UUID taskId = UUID.randomUUID();
            String insertTask = "INSERT INTO tasks (id, title, priority) VALUES (?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insertTask)) {
                ps.setObject(1, taskId);
                ps.setString(2, "Area Scan Sector 7");
                ps.setInt(3, 2);
                ps.executeUpdate();
                System.out.println("Task eingefügt.");
            }

            // Beispiel 4: Asset dem Task zuweisen
            String insertAssignment = "INSERT INTO asset_task_assignments (asset_id, task_id, state) VALUES (?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insertAssignment)) {
                ps.setObject(1, assetId);
                ps.setObject(2, taskId);
                ps.setString(3, "assigned");
                ps.executeUpdate();
                System.out.println("Assignment eingefügt.");
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
