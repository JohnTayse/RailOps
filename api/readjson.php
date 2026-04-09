<?php
header('Content-Type: application/json');

// Check if filename parameter exists
if (!isset($_POST['filename']) || empty($_POST['filename'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Filename parameter is required'
    ]);
    exit;
}

$filename = $_POST['filename'];

// Define the data folder
$dataFolder = 'data/';

// Security: Prevent directory traversal
$filename = basename($filename);

// Full path to file
$filepath = $dataFolder . $filename;

// Check if file exists
if (!file_exists($filepath)) {
    echo json_encode([
        'success' => false,
        'error' => 'File not found'
    ]);
    exit;
}

// Read file content
$content = file_get_contents($filepath);

if ($content === false) {
    echo json_encode([
        'success' => false,
        'error' => 'Error reading file'
    ]);
    exit;
}

// Decode JSON to validate it
$data = json_decode($content, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON in file: ' . json_last_error_msg()
    ]);
    exit;
}

// Return success with data
echo json_encode([
    'success' => true,
    'data' => $data
]);
?>