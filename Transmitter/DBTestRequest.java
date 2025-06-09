package Transmitter;

import java.sql.*;

public class DBTestRequest {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://192.168.178.147:5432/ares";
        String user = "ares";
        String password = "ares";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Verbindung erfolgreich.");

            String sql = "SELECT a.id, a.name, a.type, a.status, a.battery, a.created_at " +
                         "FROM assets a " +
                         "ORDER BY a.created_at";

            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {

                while (rs.next()) {
                    String id = rs.getString("id");
                    String name = rs.getString("name");
                    String type = rs.getString("type");
                    String status = rs.getString("status");
                    float battery = rs.getFloat("battery");
                    Timestamp createdAt = rs.getTimestamp("created_at");

                    System.out.println("Asset:");
                    System.out.println("  ID        : " + id);
                    System.out.println("  Name      : " + name);
                    System.out.println("  Type      : " + type);
                    System.out.println("  Status    : " + status);
                    System.out.println("  Battery   : " + battery);
                    System.out.println("  Created At: " + createdAt);
                    System.out.println("-------------------------------------");
                }

            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
