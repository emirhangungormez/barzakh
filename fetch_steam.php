<?php
/**
 * Barzakh: Star Gardener - Steam API Proxy
 * Securely fetches data from Steam Store API
 */

// Security Headers
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// CORS - Only allow requests from official domains
$allowedOrigins = [
    'https://barzakh.emirhangungormez.com.tr',
    'https://www.barzakh.emirhangungormez.com.tr',
    'http://localhost' // For development
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://barzakh.emirhangungormez.com.tr');
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Fixed App ID - no user input accepted
$appId = '3849950'; // Barzakh: Star Gardener
$apiUrl = "https://store.steampowered.com/api/appdetails?appids=" . urlencode($appId);

// Fetch data from Steam with timeout
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$json = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($json && $httpCode === 200) {
    echo $json;
} else {
    http_response_code(502);
    echo json_encode(['error' => 'Could not fetch data from Steam.']);
}

