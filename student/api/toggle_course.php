<?php

/**
 * 新增或删除报名
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
$table = $config['table']['baoming'];
// 判断该学生是否已经已经报名
$sql = "SELECT * FROM `$table` WHERE `username` = '$username' AND `course_id` = '$course_id'";
$result = mysqli_query($conn, $sql);

// 课程信息
$table2 = $config['table']['course'];
$sql = "SELECT * FROM `$table2` WHERE `course_id` = '$course_id'";
$result2 = mysqli_query($conn, $sql);
$data = mysqli_fetch_assoc($result2);

if (mysqli_num_rows($result) == 0) {
    // 检查报名人数是否超出
    if ($data['has_num'] == $data['limit_num'] && $data['limit_num'] > 0) {
        $poncon->error(902, '报名名额已满');
    }
    $sql = "INSERT INTO `$table` (`username`, `course_id`) VALUES ('$username', '$course_id')";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        $poncon->error(903, '数据库错误');
    }
    $data['baoming'] = true;
    $data['has_num']++;
    $poncon->success('报名成功', $data);
    // 更新课程信息表
    $sql = "UPDATE `$table2` SET `has_num` = {$data['has_num']} WHERE `course_id` = '$course_id'";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        $poncon->error(903, '数据库错误');
    }
} else {
    $sql = "DELETE FROM `$table` WHERE `username` = '$username' AND `course_id` = '$course_id'";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        $poncon->error(903, '数据库错误');
    }
    $data['baoming'] = false;
    $data['has_num']--;
    $poncon->success('取消报名成功', $data);
    // 更新课程信息表
    $sql = "UPDATE `$table2` SET `has_num` = {$data['has_num']} WHERE `course_id` = '$course_id'";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        $poncon->error(903, '数据库错误');
    }
}
