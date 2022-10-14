<?php

/**
 * 增加课程
 * 课程名称
 * 上课时间
 * 课程介绍
 * 课程封面
 * 上课地点
 * courseName: courseName,
 * courseType: courseType,
 * startTime: startTime,
 * coursePlace: coursePlace,
 * limitNum: limitNum,
 * msg: msg
 */

require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$username = $poncon->POST('username', '', true);
$password = $poncon->POST('password', '', true);
$poncon->login($conn, $username, $password);

$courseName = $poncon->POST('courseName', '', true);
$courseType = $poncon->POST('courseType', '', true);
$startTime = $poncon->POST('startTime', '', true);
$coursePlace = $poncon->POST('coursePlace', '', true);
$limitNum = $poncon->POST('limitNum', 0, true);
$msg = $poncon->POST('msg', '', true);
$image = $poncon->POST('image', 0, true);
$course_id = $poncon->createId(11);
if (!$courseName || !$courseType || !$startTime || !$coursePlace || !$image) {
    $poncon->error(900, '参数缺失');
}
$config = $poncon->getConfig();
$table = $config['table']['course'];
$sql = "INSERT INTO `$table` (`course_name`, `course_type`, `start_time`, `course_place`, `limit_num`, `msg`, `image`, `course_id`, `username`)
VALUES ('$courseName', '$courseType', '$startTime', '$coursePlace', $limitNum, '$msg', '$image', '$course_id', '$username')";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $this->error(903, '数据库错误');
}
$poncon->success('添加成功');
