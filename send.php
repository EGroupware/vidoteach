<?php
/**
 * Contact form handler for /de/kontakt/ and /en/contact-us/.
 *
 * The form posts its fields directly (form_id=3 German, 4 English); we answer with a
 * redirect to the thank-you page. The older AJAX format of the former WordPress form
 * plugin (action=fluentform_submit, data=<url-encoded fields>) is still accepted.
 *
 * Recipient: environment variable VIDOTEACH_MAIL_TO (set in the web server/PHP-FPM config),
 * otherwise the address named in the form's consent text.
 */

const MAIL_TO_DEFAULT = 'info@egroupware.org';
const MAIL_FROM = 'VIDOTEACH Website <noreply@vidoteach.de>';
const THANKS = [
	'de' => '/de/vielen-dank-fuer-ihre-nachricht/',
	'en' => '/en/thank-you-for-your-message/',
];
const BACK = [
	'de' => '/de/kontakt/',
	'en' => '/en/contact-us/',
];

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
	header('Location: /de/kontakt/', true, 303);
	exit;
}

$ajax = ($_POST['action'] ?? '') === 'fluentform_submit';
if ($ajax) {
	parse_str((string)($_POST['data'] ?? ''), $f);
	$formId = (string)($_POST['form_id'] ?? '');
} else {
	$f = $_POST;
	$formId = (string)($f['form_id'] ?? '');
}
$lang = $formId === '4' ? 'en' : 'de';

$val = static function ($v, int $max = 200): string {
	$v = is_string($v) ? $v : '';
	$v = trim(str_replace(["\r", "\0"], '', $v));
	return mb_substr($v, 0, $max);
};
$line = static fn($v, int $max = 200): string => str_replace("\n", ' ', $val($v, $max));

// spam trap: hidden field Fluent Forms renders as honeypot ("item_3__fluent_sf" / "item_4__fluent_sf")
foreach ($f as $k => $v) {
	if (preg_match('/^item_\d+__fluent_sf$/', (string)$k) && is_string($v) && $v !== '') {
		respond_ok($ajax, $lang);   // pretend success, send nothing
	}
}

$name = is_array($f['Name'] ?? null) ? $f['Name'] : [];
$first   = $line($name['first_name'] ?? '');
$last    = $line($name['last_name'] ?? '');
$email   = $line($f['email'] ?? '');
$company = $line($f['input_text'] ?? '');
$phone   = $line($f['phone'] ?? '', 60);
$country = $line($f['country-list'] ?? '', 100);
$message = $val($f['message'] ?? '', 10000);
$gdpr    = ($f['gdpr-agreement'] ?? '') !== '';

$de = $lang === 'de';
$errors = [];
if ($email === '') {
	$errors['email'] = ['required' => $de ? 'Dieses Feld ist erforderlich' : 'This field is required'];
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	$errors['email'] = ['email' => $de ? 'Bitte eine gültige E-Mail-Adresse eingeben' : 'Please enter a valid email address'];
}
if ($message === '') {
	$errors['message'] = ['required' => $de ? 'Dieses Feld ist erforderlich' : 'This field is required'];
}
if (!$gdpr) {
	$errors['gdpr-agreement'] = ['required' => $de ? 'Bitte stimmen Sie der Datenverarbeitung zu' : 'Please agree to the data processing'];
}
if ($errors) {
	if ($ajax) {
		http_response_code(422);
		header('Content-Type: application/json; charset=utf-8');
		echo json_encode(['errors' => $errors], JSON_UNESCAPED_UNICODE);
		exit;
	}
	header('Location: ' . BACK[$lang], true, 303);
	exit;
}

$body = "Neue Nachricht über das Kontaktformular auf vidoteach.de (" . strtoupper($lang) . ")\n\n"
	. "Vorname:  $first\n"
	. "Nachname: $last\n"
	. "E-Mail:   $email\n"
	. "Firma:    $company\n"
	. "Telefon:  $phone\n"
	. "Land:     $country\n\n"
	. "Nachricht:\n$message\n\n"
	. "Einwilligung Datenschutz: ja\n";

$to = getenv('VIDOTEACH_MAIL_TO') ?: MAIL_TO_DEFAULT;
$subject = '=?UTF-8?B?' . base64_encode('VIDOTEACH Kontaktformular: ' . (trim("$first $last") ?: $email)) . '?=';
$headers = implode("\r\n", [
	'From: ' . MAIL_FROM,
	'Reply-To: ' . $email,   // validated above, contains no line breaks
	'MIME-Version: 1.0',
	'Content-Type: text/plain; charset=UTF-8',
	'Content-Transfer-Encoding: 8bit',
]);

if (!mail($to, $subject, $body, $headers)) {
	error_log('vidoteach send.php: mail() failed');
	$msg = $de ? 'Die Nachricht konnte leider nicht gesendet werden. Bitte schreiben Sie uns an ' . $to . '.'
	           : 'Unfortunately your message could not be sent. Please write to ' . $to . '.';
	if ($ajax) {
		http_response_code(422);
		header('Content-Type: application/json; charset=utf-8');
		echo json_encode(['errors' => ['message' => ['send' => $msg]]], JSON_UNESCAPED_UNICODE);
		exit;
	}
	http_response_code(500);
	header('Content-Type: text/plain; charset=utf-8');
	echo $msg;
	exit;
}
respond_ok($ajax, $lang);

function respond_ok(bool $ajax, string $lang): void
{
	if ($ajax) {
		header('Content-Type: application/json; charset=utf-8');
		echo json_encode(['data' => ['result' => ['redirectUrl' => THANKS[$lang], 'message' => '']]]);
	} else {
		header('Location: ' . THANKS[$lang], true, 303);
	}
	exit;
}
