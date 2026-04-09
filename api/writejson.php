<?php
header('Content-Type: application/json');

$jsonInput = file_get_contents("php://input");
$data = json_decode($jsonInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON content: ' . json_last_error_msg()
    ]);
    exit;
}

// Check if required parameters exist
if (!isset($data['filename']) || empty($data['filename'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Filename parameter is required'
    ]);
    exit;
}

if (!isset($data['content'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Content parameter is required'
    ]);
    exit;
}

$filename = $data['filename'];
$content = $data['content'];

// Define the data folder
$dataFolder = 'data/';

// Security: Prevent directory traversal
$filename = basename($filename);

// Full path to file
$filepath = $dataFolder . $filename;

// Create folder if it doesn't exist
if (!is_dir($dataFolder)) {
    if (!mkdir($dataFolder, 0755, true)) {
        echo json_encode([
            'success' => false,
            'error' => 'Could not create data folder'
        ]);
        exit;
    }
}

// Check if file existed before writing
$fileExists = file_exists($filepath);

// Write to file with pretty print
$json = json_encode($content, JSON_PRETTY_PRINT);
$result = file_put_contents($filepath, $json);

if ($result === false) {
    echo json_encode([
        'success' => false,
        'error' => 'Error writing to file'
    ]);
    exit;
}

// Return success
echo json_encode([
    'success' => true,
    'message' => $fileExists ? 'File updated successfully' : 'File created successfully',
    'bytes' => $result
]);
?>