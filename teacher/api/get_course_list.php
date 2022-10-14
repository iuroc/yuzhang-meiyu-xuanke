<?php

/**
 * 
 * 获取课程列表
 */
require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$username = $poncon->POST('username', '', true);
$password = $poncon->POST('password', '', true);
$poncon->login($conn, $username, $password);

$config = $poncon->getConfig();
$table = $config['table']['course'];
$table_user = $config['table']['user'];
$sql = "SELECT *, (SELECT `name` FROM `$table_user` WHERE `username` = '$username') AS `teacher_name` FROM `$table` WHERE `username` = '$username'";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $poncon->error(903, '数据库出错');
}

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}
$poncon->success('获取成功', $data);
