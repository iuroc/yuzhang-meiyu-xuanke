<?php

/**
 * 获取学生课程列表
 */
require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$username = $poncon->POST('username', '', true);
$password = $poncon->POST('password', '', true);
$poncon->login($conn, $username, $password);

$config = $poncon->getConfig();
$table = $config['table']['baoming'];
$table2 = $config['table']['course'];
$table3 = $config['table']['user_teacher'];

$sql = "SELECT B.*, C.`name` AS 'teacher_name' FROM `$table` AS A, `$table2` AS B, `$table3` AS C WHERE A.`username` = '$username' AND A.`course_id` = B.`course_id` AND B.`username` = C.`username`";
$result = mysqli_query($conn, $sql);
$data = mysqli_fetch_all($result, MYSQLI_ASSOC);
$poncon->success('获取成功', $data);
