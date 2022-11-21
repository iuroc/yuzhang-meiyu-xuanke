"use strict";
history.scrollRestoration = 'manual';
$(document).ready(function () {
    if (!Poncon.login(true)) {
        location.hash = '/login';
    }
    router(location.hash);
    function router(hash) {
        var hashs = hash.split('/');
        var target = hashs[1];
        // target非法状态
        if (!target || !target.match(/^\w+$/)) {
            target = 'home';
        }
        $('.page-oyp').css('display', 'none');
        var Page = $('.page-' + target);
        Page.css('display', 'block');
        // 控制侧边选项卡阴影
        $('.oyp-action, .oyp-action-sm').removeClass('active');
        $('.tab-' + target).addClass('active');
        if (target == 'home') {
            history.replaceState({}, '', './');
            document.title = '我的课程 - ' + Poncon.title;
            if (!Poncon.load.home) {
                Poncon.load_course_list();
            }
        }
        else if (target == 'login') {
            document.title = (hashs[2] == 'register' ? '教师注册' : '教师登录') + ' - ' + Poncon.title;
            $('.page-sub').css('display', 'none');
            $('.page-sub-' + (hashs[2] == 'register' ? 'register' : 'login') + '').css('display', 'block');
        }
        else if (target == 'add') {
            if (!Poncon.load.add) {
                Poncon.load_course_types();
            }
            if (hashs[2] == 'edit' && hashs[3]) {
                document.title = '编辑课程 - ' + Poncon.title;
                Poncon.edit_course(hashs[3]);
                $('.page-add .add_sdfsdf').html('编辑课程');
                $('.page-add .delete_jshxa').show();
            }
            else {
                document.title = '新增课程 - ' + Poncon.title;
                $('.page-add .add_sdfsdf').html('新增课程');
                if (Poncon.data.add.edit) {
                    Poncon.click_clean(true);
                    Poncon.data.add.edit = false;
                }
                $('.page-add .delete_jshxa').hide();
            }
        }
        else if (target == 'view') {
            var course_id = hashs[2];
            Poncon.view_course(course_id);
        }
        else {
            location.hash = '';
        }
    }
    document.body.ondragstart = function () { return false; };
    window.addEventListener('hashchange', function (event) {
        var hash = new URL(event.newURL).hash;
        router(hash);
    });
    $('.file_jhsgdh').change(function () {
        var fileData = $(this).prop('files');
        Poncon.upload(fileData[0]);
        $(this).val('');
    });
});
var Poncon = {
    title: '教师端',
    storageKey: 'yzetmy_teacher',
    data: {
        add: {
            edit: false,
            courseTypes: {},
            edit_course_id: '',
            image_url: ''
        }
    },
    load: {
        home: false,
        load: false,
        add: false,
        view: false
    },
    loginStatus: false,
    tempTitle: {},
    request: $.post('api/empty.php'),
    /**
     * 用户登陆
     * @param {boolean} ifLoad 是否是初始化验证，如果是，则不弹窗提示
     * @returns {boolean} 是否验证成功
     */
    login: function (ifLoad) {
        var username = this.getStorage('username');
        var password = this.getStorage('password');
        if (!username || !password) {
            this.notLogin();
            return false;
        }
        var success = false;
        var This = this;
        $.ajax({
            method: 'post',
            url: 'api/login.php',
            data: {
                username: username,
                password: password
            },
            contentType: 'application/x-www-form-urlencoded',
            dataType: 'json',
            success: function (data) {
                if (data.code == 200) {
                    success = true;
                    This.setStorage('username', username);
                    This.setStorage('password', password);
                    This.loginStatus = true;
                    $('.show-hasLogin').show();
                    $('.show-noLogin').hide();
                    if (location.hash.split('/')[1] == 'login' && !ifLoad) {
                        location.hash = '';
                    }
                    return true;
                }
                if (!ifLoad) {
                    alert(data.msg);
                }
                This.notLogin();
                success = false;
                return false;
            },
            async: false
        });
        return success;
    },
    /**
     * 获取存储值
     * @param {string} key 键名
     * @returns {any} 返回值
     */
    getStorage: function (key) {
        var data = localStorage[this.storageKey];
        try {
            data = JSON.parse(data);
            return data[key];
        }
        catch (_a) {
            return '';
        }
    },
    /**
     * 设置存储值
     * @param {string} key 键名
     * @param {any} value 值
     */
    setStorage: function (key, value) {
        var data = localStorage[this.storageKey];
        data = data ? data : '{}';
        try {
            data = JSON.parse(data);
        }
        catch (_a) {
            data = {};
        }
        data[key] = value;
        localStorage[this.storageKey] = JSON.stringify(data);
    },
    /**
     * 未登录状态
     */
    notLogin: function () {
        $('.show-hasLogin').hide();
        $('.show-noLogin').show();
        this.loginStatus = false;
        this.setStorage('username', '');
        this.setStorage('password', '');
    },
    /**
     * 点击登录
     * @returns
     */
    click_login: function () {
        var Page = $('.page-sub-login');
        var username = Page.find('.input-username').val();
        var password = Page.find('.input-password').val();
        if (!username.match(/^1[3-9]\d{9}$/)) {
            alert('手机号格式错误');
            return;
        }
        if (!password.match(/^\w{4,20}$/)) {
            alert('密码格式错误');
            return;
        }
        this.setStorage('username', username);
        this.setStorage('password', md5(password));
        this.login();
    },
    click_register: function () {
        var Page = $('.page-sub-register');
        var username = Page.find('.input-username').val();
        var name = Page.find('.input-name').val();
        var password = Page.find('.input-password').val();
        var password_repeat = Page.find('.input-password-repeat').val();
        if (password != password_repeat) {
            alert('两次输入的密码不一样');
            return;
        }
        if (!username.match(/^1[3-9]\d{9}$/)) {
            alert('手机号格式错误');
            return;
        }
        if (!password.match(/^\w{4,20}$/)) {
            alert('密码格式错误');
            return;
        }
        if (name.match(/^\s*$/)) {
            alert('请输入姓名');
            return;
        }
        var This = this;
        $.post('api/register.php', {
            username: username,
            password: md5(password),
            name: name
        }, function (data) {
            if (data.code == 200) {
                alert('注册成功，即将自动登录');
                This.setStorage('username', username);
                This.setStorage('password', md5(password));
                This.login();
                return;
            }
            alert(data.msg);
        });
    },
    /**
     * 退出登录
     */
    logout: function () {
        if (confirm('确定要退出登录吗？')) {
            localStorage[this.storageKey] = '';
            location.reload();
        }
    },
    /**
     * 点击上传图片
     */
    click_upload: function () {
        var Page = $('.page-add');
        Page.find('input.file_jhsgdh').click();
    },
    /**
     * 开始上传文件
     */
    upload: function (fileData) {
        if (fileData.size > 1048576) {
            alert('图片不能大于1MB，请压缩后上传');
            return;
        }
        var This = this;
        var formData = new FormData();
        formData.append('file', fileData);
        formData.append('name', fileData.name);
        formData.append('puid', '19673665');
        formData.append('_token', '7347af7b58c7297d1398035f530c4155');
        $.ajax({
            method: 'post',
            url: '//pan-yz.chaoxing.com/upload/uploadfile',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            dataType: 'json',
            error: function (e) {
                alert('出错：' + e.statusText);
            },
            success: function (data) {
                var image_url = 'https://img.apee.top/i/' + data.data.residstr;
                This.data.add.image_url = image_url;
                $('._jhsgdfhsghf').attr('src', image_url).show();
            }
        });
    },
    /**
     * 加载课程分类选项列表
     */
    load_course_types: function () {
        $.get('api/course_types.json', function (data) {
            Poncon.data.add.courseTypes = data;
            var html = '';
            data.forEach(function (item) {
                html += "<option value=\"".concat(item.courseTypeId, "\">").concat(item.courseType, "</option>");
            });
            $('.page-add ._jhsghd').html(html);
            Poncon.load.add = true;
        });
    },
    /**
     * 点击新增课程
     */
    click_addCourse: function () {
        var Page = $('.page-add');
        var courseName = Page.find('.input-courseName').val();
        var courseType = Page.find('.input-courseType').val();
        var startTime = Page.find('.input-startTime').val();
        var coursePlace = Page.find('.input-coursePlace').val();
        var limitNum = Page.find('.input-limitNum').val();
        var msg = Page.find('.input-msg').val();
        if (!courseName || !courseType || !startTime || !coursePlace || !this.data.add.image_url) {
            alert('请将带星号的项目填写完整');
            return;
        }
        var now = new Date().getTime();
        if (new Date(startTime).getTime() < now) {
            alert('请输入正确的上课时间');
            return;
        }
        var data = {
            courseName: courseName,
            courseType: courseType,
            startTime: startTime,
            coursePlace: coursePlace,
            limitNum: limitNum,
            msg: msg,
            image: this.data.add.image_url,
            username: this.getStorage('username'),
            password: this.getStorage('password'),
            edit: Poncon.data.add.edit_course_id
        };
        var This = this;
        $.post('api/add_course.php', data, function (data) {
            alert(data.msg);
            if (data.code == 200) {
                Poncon.load.home = false;
                location.hash = '';
                This.click_clean(true);
                return;
            }
        });
    },
    /**
     * 新增课程页面，点击清空表单
     */
    click_clean: function (boo) {
        if (boo || confirm('确定要清空重填吗？')) {
            var Page = $('.page-add');
            Page.find('input').val('');
            Page.find('textarea').val('');
            this.data.add.image_url = '';
            $('._jhsgdfhsghf').removeAttr('src').hide();
        }
    },
    /**
     * 加载课程列表
     */
    load_course_list: function () {
        var Page = $('.page-home');
        $.post('api/get_course_list.php', {
            username: this.getStorage('username'),
            password: this.getStorage('password')
        }, function (data) {
            if (data.code == 200) {
                var html = '';
                data.data.forEach(function (item) {
                    html += "<div class=\"col-xl-3 col-lg-4 col-md-6\">\n                                <div class=\"card _uausua mb-3\">\n                                    <div class=\"embed-responsive embed-responsive-16by9\">\n                                        <img src=\"".concat(item.image, "\" class=\"card-img-top embed-responsive-item\">\n                                        <div class=\"_asasahbg mb-3\">\n                                            <button class=\"btn mr-2 shadow btn-info btn-sm\" onclick=\"location.hash='/view/").concat(item.course_id, "'\">\u67E5\u770B\u6570\u636E</button>\n                                            <button class=\"btn mr-3 shadow btn-primary btn-sm\" onclick=\"location.hash='/add/edit/").concat(item.course_id, "'\">\u7F16\u8F91\u8BFE\u7A0B</button>\n                                        </div>\n                                    </div>\n                                    <div class=\"card-body\">\n                                        <h5 class=\"card-title\">").concat(item.course_name, "</h5>\n                                        <div class=\"row small mb-2\">\n                                            <div class=\"col pr-0\">\u4E3B\u8BB2\uFF1A").concat(item.teacher_name, "</div>\n                                            <div class=\"col\">\u62A5\u540D\uFF1A").concat(item.has_num, " / ").concat(item.limit_num == 0 ? '不限' : item.limit_num, "</div>\n                                        </div>\n                                        <div class=\"time small\">\u5F00\u8BFE\u65F6\u95F4\uFF1A").concat(Poncon.parse_date(item.start_time), "</div>\n                                    </div>\n                                </div>\n                            </div>");
                });
                Page.find('.list_9asia').html(html);
                Poncon.load.home = true;
                return;
            }
        });
    },
    /**
     * 转换时间为剩余时间
     * @param {string} str 时间datatime
     */
    parse_date: function (str) {
        var timestamp = new Date(str).getTime();
        var now = new Date().getTime();
        var num = timestamp - now;
        if (num < 24 * 3.6E6 && num > 0) {
            var hour = Math.floor(num / 3.6E6);
            num -= hour * 3.6E6;
            var min = Math.floor(num / 6E4);
            num -= min * 6E4;
            var sec = Math.floor(num / 1000);
            return "\u5269\u4F59 ".concat(hour, " \u5C0F\u65F6 ").concat(min, " \u5206\u949F");
        }
        else if (num < 0) {
            return '课程已结束';
        }
        else {
            return str;
        }
    },
    /**
     * 编辑课程
     * @param {string} course_id 课程ID
     */
    edit_course: function (course_id) {
        var Page = $('.page-add');
        var This = this;
        $.post('api/get_course_info.php', {
            username: this.getStorage('username'),
            password: this.getStorage('password'),
            course_id: course_id
        }, function (data) {
            if (data.code == 200) {
                Poncon.data.add.edit = true;
                Poncon.data.add.edit_course_id = course_id;
                Page.find('.input-courseName').val(data.data.course_name);
                Page.find('.input-courseType').val(data.data.course_type);
                Page.find('.input-startTime').val(data.data.start_time);
                Page.find('.input-coursePlace').val(data.data.course_place);
                Page.find('.input-limitNum').val(data.data.limit_num);
                Page.find('.input-msg').val(data.data.msg);
                $('._jhsgdfhsghf').attr('src', data.data.image).show();
                This.data.add.image_url = data.data.image;
                return;
            }
            alert(data.msg);
        });
    },
    /**
     * 点击删除课程
     */
    click_delete: function () {
        if (!confirm('确定要删除课程吗？')) {
            return;
        }
        var course_id = Poncon.data.add.edit_course_id;
        $.post('api/delete_course.php', {
            username: this.getStorage('username'),
            password: this.getStorage('password'),
            course_id: course_id
        }, function (data) {
            if (data.code == 200) {
                Poncon.load.home = false;
                location.href = '#';
            }
            alert(data.msg);
        });
    },
    /**
     * 查看课程数据
     */
    view_course: function (course_id) {
        var Page = $('.page-view');
        $.post('api/get_course_info.php', {
            username: this.getStorage('username'),
            password: this.getStorage('password'),
            course_id: course_id,
            baoming_list: 1
        }, function (data) {
            if (data.code == 200) {
                var baoming = data.data.baoming;
                var html_1 = '';
                baoming.forEach(function (item, index) {
                    html_1 += "<tr>\n                                <th scope=\"row\">1</th>\n                                <td>".concat(item.name, "</td>\n                                <td>").concat(item.username, "</td>\n                            </tr>");
                });
                Page.find('.baoming_list').html(html_1);
                return;
            }
            alert(data.msg);
        });
    }
};
