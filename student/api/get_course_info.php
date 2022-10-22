<?php

/**
 * 获取课程详情
 */
require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$course_id = $poncon->POST('course_id', '', true);
$config = $poncon->getConfig();
$table = $config['table']['course'];
$table_user = $config['table']['user_teacher'];
$sql = "SELECT A.*, B.`name` AS 'teacher_name' FROM `$table` AS A, `$table_user` AS B WHERE A.`username` = B.`username` AND A.`course_id` = '$course_id' AND A.`start_time` > NOW() ORDER BY A.`start_time`;";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $poncon->error(903, '数据库出错');
}

$data = mysqli_fetch_assoc($result);
$poncon->success('获取成功', $data);
