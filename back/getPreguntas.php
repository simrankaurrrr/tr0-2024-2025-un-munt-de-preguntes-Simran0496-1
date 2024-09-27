<?php

$info = file_get_contents("./data.json");
$datos = json_decode($info, true);

// 10 preguntas aleatorias
$preguntes_aleatories = array_rand($datos['preguntes'], 10);
$preguntes_seleccionades = [];

foreach ($preguntes_aleatories as $index) {
    $preguntes_seleccionades[] = $datos['preguntes'][$index];
}

// guardar las preguntas en la sesión
$_SESSION['preguntes'] = $preguntes_seleccionades;

echo json_encode($preguntes_seleccionades);
