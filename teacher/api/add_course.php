<?php

/**
 * 增加课程
 * 课程名称
 * 上课时间
 * 课程介绍
 * 课程封面
 * 上课地点
 */

require './Poncon.php';

use Poncon\Poncon;

$poncon = new Poncon();
$conn = $poncon->initDb();

$username = $poncon->POST('username', '', true);
$password = $poncon->POST('password', '', true);
$poncon->login($conn, $username, $password);
