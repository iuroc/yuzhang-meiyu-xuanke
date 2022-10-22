<?php

/**
 * 
 * 获取课程列表
 */
require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$typeId = $poncon->POST('typeId', '', true);

$config = $poncon->getConfig();
$table = $config['table']['course'];
$table_user = $config['table']['user_teacher'];
$sql = "SELECT A.`image`, A.`course_name`, A.`course_type`, A.`has_num`, A.`limit_num`, A.`start_time`, A.`course_id`, B.`name` AS 'teacher_name' FROM `$table` AS A, `$table_user` AS B WHERE A.`username` = B.`username` AND A.`course_type` = '$typeId' AND A.`start_time` > NOW() ORDER BY A.`start_time`;";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $poncon->error(903, '数据库出错');
}

$data = mysqli_fetch_all($result, MYSQLI_ASSOC);
$poncon->success('获取成功', $data);
