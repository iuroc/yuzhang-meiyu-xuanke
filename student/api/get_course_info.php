<?php

/**
 * 获取课程详情
 */
require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$course_id = $poncon->POST('course_id', '', true);
$username = $poncon->POST('username', '', true);
$password = $poncon->POST('password', '', true);

$config = $poncon->getConfig();
$table = $config['table']['course'];
$table_user = $config['table']['user_teacher'];
$sql = "SELECT A.*, B.`name` AS 'teacher_name', B.`username` AS `teacher_id` FROM `$table` AS A, `$table_user` AS B WHERE A.`username` = B.`username` AND A.`course_id` = '$course_id' ORDER BY A.`start_time`;";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $poncon->error(903, '数据库出错');
}

$data = mysqli_fetch_assoc($result);
$data['baoming'] = false;
if ($username) {
    $poncon->login($conn, $username, $password);
    // 查询用户是否报名
    $table2 = $config['table']['baoming'];
    $sql = "SELECT * FROM `$table2` WHERE `username` = '$username' AND `course_id` = '$course_id'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
        $data['baoming'] = true;
    }
}
$poncon->success('获取成功', $data);
