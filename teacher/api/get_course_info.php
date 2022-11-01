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
$baoming_list = $poncon->POST('baoming_list', 0, true);
$config = $poncon->getConfig();
$table = $config['table']['course'];
$sql = "SELECT * FROM `$table` WHERE `username` = '$username' AND `course_id` = '$course_id'";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $poncon->error(903, '数据库出错');
}
$data = mysqli_fetch_assoc($result);

// 是否查询报名数据表

if ($baoming_list == '1') {
    $table2 = $config['table']['baoming'];
    $table3 = $config['table']['user_student'];
    $sql = "SELECT A.*, B.`name` FROM `$table2` AS A, `$table3` AS B WHERE A.`course_id` = '$course_id' AND A.`username` = B.`username`";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        $poncon->error(903, '数据库出错');
    }
    $data = [
        'info' => $data
    ];
    $data['baoming'] = mysqli_fetch_all($result, MYSQLI_ASSOC);
}

$poncon->success('获取成功', $data);
