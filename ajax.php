<?php
require_once 'taobao.php';

$a = $_GET['a'] ? $_GET['a'] : '';
$q = $_GET['q'] ? $_GET['q'] : '';
if (empty($a) || empty($q)) 
	exit(0);
switch($a) {
	case 'tb':
		$tb = new TaoBao();
		echo json_encode($tb->getData($q));
	break;
}
?>
