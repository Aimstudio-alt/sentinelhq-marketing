<?php
header('Content-Type: application/json');

// Honeypot — bots fill hidden fields, humans don't
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

function clean(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$name           = clean($_POST['name']           ?? '');
$email          = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone          = clean($_POST['phone']          ?? '');
$org            = clean($_POST['org']            ?? '');
$product        = clean($_POST['product']        ?? '');
$preferred_date = clean($_POST['preferred_date'] ?? '');
$preferred_time = clean($_POST['preferred_time'] ?? '');
$message        = clean($_POST['message']        ?? '');

if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please provide your name and a valid email address.']);
    exit;
}

$to      = 'hello@sentinelhq.co.uk';
$subject = 'SentinelHQ enquiry from ' . $name;

$lines = [
    'New enquiry from sentinelhq.co.uk',
    '',
    'Name:  ' . $name,
    'Email: ' . $email,
];
if ($phone)          $lines[] = 'Phone: '          . $phone;
if ($org)            $lines[] = 'Organisation: '   . $org;
if ($product)        $lines[] = 'Product: '        . $product;
if ($preferred_date) $lines[] = 'Preferred date: ' . $preferred_date;
if ($preferred_time) $lines[] = 'Preferred time: ' . $preferred_time;
if ($message) {
    $lines[] = '';
    $lines[] = 'Message:';
    $lines[] = $message;
}

$body    = implode("\n", $lines);
$headers = implode("\r\n", [
    'From: noreply@sentinelhq.co.uk',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
]);

mail($to, $subject, $body, $headers);

echo json_encode(['success' => true]);
