<?php
// backend/api/tasks.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM tasks ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!empty($data['title'])) {
            $stmt = $pdo->prepare("INSERT INTO tasks (title, description) VALUES (?, ?)");
            if ($stmt->execute([$data['title'], $data['description'] ?? ''])) {
                echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Task created']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Failed to create task']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Title is required']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!empty($data['id'])) {
            $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?");
            if ($stmt->execute([$data['title'], $data['description'], $data['status'], $data['id']])) {
                echo json_encode(['message' => 'Task updated']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Failed to update task']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'ID is required']);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $_GET['id'] ?? $data['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(['message' => 'Task deleted']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Failed to delete task']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'ID is required']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
?>
