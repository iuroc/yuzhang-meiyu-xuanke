<?php

/**
 * 删除课程
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
$sql = "DELETE FROM `$table` WHERE `username` = '$username' AND `course_id` = '$course_id'";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $this->error(903, '数据库错误');
}
$poncon->success('删除成功');
