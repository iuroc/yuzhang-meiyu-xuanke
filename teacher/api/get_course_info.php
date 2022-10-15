<?php

/**
 * 
 * 获取课程信息
 */

require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$username = $poncon->POST('username', '', true);
$password = $poncon->POST('password', '', true);
$poncon->login($conn, $username, $password);
$course_id = $poncon->POST('course_id', '', true);
$config = $poncon->getConfig();
$table = $config['table']['course'];
$sql = "SELECT * FROM `$table` WHERE `username` = '$username' AND `course_id` = '$course_id'";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $poncon->error(903, '数据库出错');
}
$data = mysqli_fetch_assoc($result);
$poncon->success('获取成功', $data);
