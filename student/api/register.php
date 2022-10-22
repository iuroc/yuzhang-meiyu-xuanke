<?php

/**
 * 学生注册
 */
require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$username = $poncon->POST('username', '', true);
$password = $poncon->POST('password', '', true);
$name = $poncon->POST('name', '', true);

// 校验字段
if (!preg_match('/^\w{4,20}$/', $username) || strlen($password) != 32) {
    $poncon->error(905, '账号或密码格式错误');
}
if (mb_strlen($name) == 0) {
    $poncon->error(905, '请输入姓名');
}

// 查询用户是否存在
$config = $poncon->getConfig();
$table = $config['table']['user'];
$sql = "SELECT `username` FROM `$table` WHERE `username` = '$username'";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $poncon->error(903, '数据库出错');
}
if (mysqli_num_rows($result) > 0) {
    $poncon->error(902, '该账号已被注册');
}

// 开始注册
$sql = "INSERT INTO `$table` (`username`, `password`, `name`) VALUES ('$username', '$password', '$name')";
$result = mysqli_query($conn, $sql);
if (!$result) {
    $poncon->error(903, '数据库出错');
}
$poncon->success('注册成功');
