<?php

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Step 1 --------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$curl1 = curl_init();

$fileContent = file_get_contents('/path/to/examples/example.receipt.xml');

try {
    $fileContent = new SimpleXMLElement($fileContent);
    $xml = $fileContent->asXML();
} catch (Exception $ex) {
    echo $ex->getMessage();
    die();
}

curl_setopt_array($curl1, array(
    CURLOPT_PORT => "3000",
    CURLOPT_URL => "http://0.0.0.0:3000/sign",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => $xml
));

$response = curl_exec($curl1);
$err = curl_error($curl1);

curl_close($curl1);

if ($err) {
    echo "cURL Error 1:" . $err;
    die();
}

$jsonDecoded = json_decode($response);

if (!$jsonDecoded->success) {
    echo "cURL Error 2";
    die();
}

$base64Decoded = base64_decode($jsonDecoded->data);

// var_dump($base64Decoded);
// echo strlen($base64Decoded);
//file_put_contents('signedData.p7s', $base64Decoded);

//die();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Step 2 --------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$curl2 = curl_init();

curl_setopt_array($curl2, array(
    CURLOPT_URL => "http://80.91.165.208/er/doc",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => $base64Decoded,
    CURLOPT_HTTPHEADER => array(
        "Content-Type: application/octet-stream",
        "Content-Length: " . strlen($base64Decoded)
    ),
));

$response = curl_exec($curl2);
$err = curl_error($curl2);

curl_close($curl2);

if ($err) {
    echo "cURL Error 3:" . $err;
    die();
}

file_put_contents('123.txt', $response);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Step 3 --------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$curl3 = curl_init();

curl_setopt_array($curl3, array(
    CURLOPT_PORT => "3000",
    CURLOPT_URL => "http://0.0.0.0:3000/decrypt",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => base64_encode($response),
));

$response = curl_exec($curl3);
$err = curl_error($curl3);

curl_close($curl3);

if ($err) {
    echo "cURL Error 5:" . $err;
    die();
}

$jsonDecoded = json_decode($response);

if (!$jsonDecoded->success) {
    echo "cURL Error 6";
    die();
}

$base64Decoded = base64_decode($jsonDecoded->data);

echo "-------> Decoded response after creating item:\n\n";
echo $base64Decoded;

$hasMatches = preg_match('/<ORDERTAXNUM>(.+)<\/ORDERTAXNUM>/', $base64Decoded, $matches);

//print_r($matches);

if (!$hasMatches) {
    echo "cURL Error 7";
    die();
}

$numFiscal = $matches[1];

echo "\n\n-------> NumFiscal: $numFiscal\n";







////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Step 4 --------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$curl4 = curl_init();

curl_setopt_array($curl4, array(
    CURLOPT_PORT => "3000",
    CURLOPT_URL => "http://0.0.0.0:3000/sign",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => '{"Command":"Check","NumFiscal":"' . $numFiscal . '"}',
//    CURLOPT_POSTFIELDS => '{"Command":"Check","NumFiscal":"' . 38470 . '"}',
));

$response = curl_exec($curl4);
$err = curl_error($curl4);

curl_close($curl4);

if ($err) {
    echo "cURL Error 8:" . $err;
    die();
}

$jsonDecoded = json_decode($response);

if (!$jsonDecoded->success) {
    echo "cURL Error 9";
    die();
}

$base64Decoded = base64_decode($jsonDecoded->data);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Step 5 --------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


$curl5 = curl_init();

curl_setopt_array($curl5, array(
    CURLOPT_URL => "http://80.91.165.208/er/cmd",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => $base64Decoded,
    CURLOPT_HTTPHEADER => array(
        "Content-Type: application/octet-stream",
        "Content-Length: " . strlen($base64Decoded)
    ),
));

$response = curl_exec($curl5);
$err = curl_error($curl5);

curl_close($curl5);

if ($err) {
    echo "cURL Error 10:" . $err;
    die();
}


file_put_contents('44444.txt', $response);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Step 6 --------------------------------------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$curl6 = curl_init();

curl_setopt_array($curl6, array(
    CURLOPT_PORT => "3000",
    CURLOPT_URL => "http://0.0.0.0:3000/decrypt",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => base64_encode($response),
));

$response = curl_exec($curl6);
$err = curl_error($curl6);

curl_close($curl6);

if ($err) {
    echo "cURL Error 11:" . $err;
    die();
}

$jsonDecoded = json_decode($response);

if (!$jsonDecoded->success) {
    echo "cURL Error 12";
    die();
}

$base64Decoded = base64_decode($jsonDecoded->data);

file_put_contents('signedData3.p7s', $base64Decoded);

echo "\n-------> Decoded response after requesting item data:\n\n";
print_r('<pre>');
//echo htmlspecialchars($base64Decoded) . "</br>";
echo $base64Decoded . "</br>";
print_r('</pre>');
