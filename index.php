<?php
$list = require_once "./list.php";
$ids = array_keys($list);
$vid = !empty($_GET['id']) ? htmlspecialchars($_GET['id']) : $ids[0];
if (empty($list[$vid])) $vid = $ids[0];
$videoInfo = @file_get_contents('https://openapi.youku.com/v2/videos/show_basic.json?client_id=9266b5c9362fc15c&video_id='.$vid);
if (!$videoInfo)
	exit('video info get failed!');
$videoInfo = json_decode($videoInfo);
if (empty($videoInfo->duration))
	exit('video duration get failed!');
$info = $list[$vid];
$alltime = $videoInfo->duration*1;
//header('Content-type:text/html; charset=utf-8');
include "templates/header.html";
include "templates/index.html";
include "templates/footer.html";
?>
