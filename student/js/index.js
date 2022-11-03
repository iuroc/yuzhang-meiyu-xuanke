history.scrollRestoration = 'manual'
$(document).ready(function () {
    Poncon.login(true)
    router(location.hash)
    function router(hash) {
        hash = hash.split('/')
        var target = hash[1]
        // target非法状态
        if (!target || !target.match(/^\w+$/)) {
            target = 'home'
        }
        $('.page-oyp').css('display', 'none')
        var Page = $('.page-' + target)
        Page.css('display', 'block')
        // 控制侧边选项卡阴影
        $('.oyp-action, .oyp-action-sm').removeClass('active')
        $('.tab-' + target).addClass('active')
        if (target == 'home') {
            document.title = '我要选课 - ' + Poncon.title
            var typeId = hash[2] || 'taoyi'
            if (!Poncon.load.home) {
                Poncon.load_course_types(typeId)
            }
        } else if (target == 'info') {
            document.title = '课程详情 - ' + Poncon.title
            var courseId = hash[2]
            if (!Poncon.load.info) {
                Poncon.load_course_info(courseId)
            }
        } else if (target == 'login') {
            document.title = (hash[2] == 'register' ? '学生注册' : '学生登录') + ' - ' + Poncon.title
            $('.page-sub').css('display', 'none')
            $('.page-sub-' + (hash[2] == 'register' ? 'register' : 'login') + '').css('display', 'block')
        } else if (target == 'myCourse') {
            document.title = '我的课程'
            if (!Poncon.load.myCourse) {
                Poncon.load_my_course_list()
            }
        } else {
            location.hash = ''
        }
    }
    document.body.ondragstart = () => { return false }
    window.addEventListener('hashchange', function (event) {
        var hash = new URL(event.newURL).hash
        router(hash)
    })
    $('.page-home .tabs-row').bind('wheel', function (event) {
        this.scrollLeft += event.originalEvent.deltaY
    })
})

const Poncon = {
    title: '学生端',
    storageKey: 'yzetmy_student', // 本地存储键名
    data: {
        add: {}
    },
    load: {}, // 页面初始化加载完成情况，pageName: true/false
    tempTitle: {}, // 用于必要时记录页面标题
    // request: $.post('api/empty.php'),
    /**
     * 用户登陆
     * @param {boolean} ifLoad 是否是初始化验证，如果是，则不弹窗提示
     * @returns {boolean} 是否验证成功
     */
    login(ifLoad) {
        var username = this.getStorage('username')
        var password = this.getStorage('password')
        if (!username || !password) {
            this.notLogin()
            return false
        }
        var success
        var This = this
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
                    success = true
                    This.setStorage('username', username)
                    This.setStorage('password', password)
                    This.loginStatus = true
                    $('.show-hasLogin').show()
                    $('.show-noLogin').hide()
                    if (location.hash.split('/')[1] == 'login' && !ifLoad) {
                        setTimeout(() => {
                            location.hash = ''
                        }, 1000);
                    }
                    return true
                }
                if (!ifLoad) {
                    alert(data.msg)
                }
                This.notLogin()
                success = false
                return false
            },
            async: false
        })
        return success
    },
    /**
     * 获取存储值
     * @param {string} key 键名
     * @returns {any} 返回值
     */
    getStorage(key) {
        var data = localStorage[this.storageKey]
        try {
            data = JSON.parse(data)
            return data[key]
        } catch {
            return null
        }
    },
    /**
     * 设置存储值
     * @param {string} key 键名
     * @param {any} value 值
     */
    setStorage(key, value) {
        var data = localStorage[this.storageKey]
        data = data ? data : '{}'
        try {
            data = JSON.parse(data)
        } catch {
            data = {}
        }
        data[key] = value
        localStorage[this.storageKey] = JSON.stringify(data)
    },
    /**
     * 未登录状态
     */
    notLogin() {
        $('.show-hasLogin').hide()
        $('.show-noLogin').show()
        this.loginStatus = false
        this.setStorage('username', '')
        this.setStorage('password', '')
    },
    /**
     * 点击登录
     * @returns
     */
    click_login() {
        var Page = $('.page-sub-login')
        var username = Page.find('.input-username').val()
        var password = Page.find('.input-password').val()
        if (!username.match(/^1[3-9]\d{9}$/)) {
            alert('手机号格式错误')
            return
        }
        if (!password.match(/^\w{4,20}$/)) {
            alert('密码格式错误')
            return
        }
        this.setStorage('username', username)
        this.setStorage('password', md5(password))
        this.login()
    },

    click_register() {
        var Page = $('.page-sub-register')
        var username = Page.find('.input-username').val()
        var name = Page.find('.input-name').val()
        var password = Page.find('.input-password').val()
        var password_repeat = Page.find('.input-password-repeat').val()
        if (password != password_repeat) {
            alert('两次输入的密码不一样')
            return
        }
        if (!username.match(/^1[3-9]\d{9}$/)) {
            alert('手机号格式错误')
            return
        }
        if (!password.match(/^\w{4,20}$/)) {
            alert('密码格式错误')
            return
        }
        if (name.match(/^\s*$/)) {
            alert('请输入姓名')
            return
        }
        var This = this
        $.post('api/register.php', {
            username: username,
            password: md5(password),
            name: name
        }, function (data) {
            if (data.code == 200) {
                alert('注册成功，即将自动登录')
                This.setStorage('username', username)
                This.setStorage('password', md5(password))
                This.login()
                return
            }
            alert(data.msg)
        })
    },
    /**
     * 退出登录
     */
    logout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage[this.storageKey] = ''
            location.reload()
        }
    },
    /**
     * 加载课程分类列表
     */
    load_course_types(id) {
        $.get('../teacher/api/course_types.json', function (data) {
            list = Array.isArray(data) ? data : []
            var html = ''
            list.forEach(item => {
                html += `<button class="btn btn-light border courseTypeListItem courseTypeListItem-${item.courseTypeId}" onclick="Poncon.get_course_list('${item.courseTypeId}')">${item.courseType}</button>`
            })
            $('.page-home .tabs-row').html(html)
            Poncon.load.home = true
            Poncon.get_course_list(id)
            $('.page-home .courseTypeListItem-' + id).removeClass('btn-light border').addClass('btn-secondary')
        })
    },
    /**
     * 获取某类课程列表
     * @param {string} typeId 课程分类ID
     */
    get_course_list(typeId) {
        $('.page-home .courseTypeListItem').removeClass('btn-secondary').addClass('btn-light border')
        $('.page-home .courseTypeListItem-' + typeId).removeClass('btn-light border').addClass('btn-secondary')
        $.post('api/get_course_list.php', {
            typeId: typeId
        }, function (data) {
            var list = Array.isArray(data.data) ? data.data : []
            var html = Poncon.make_list_html(list)
            $('.page-home .courseList').html(html)
        })
    },
    make_list_html(list) {
        var html = ''
        list.forEach(item => {
            html += `<div class="col-xl-3 col-lg-4 col-md-6">
                    <div class="card _uausua mb-3" onclick="location.hash='/info/${item.course_id}'">
                        <div class="embed-responsive embed-responsive-16by9">
                            <img src="${item.image}" class="card-img-top embed-responsive-item">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${item.course_name}</h5>
                            <div class="row small mb-2">
                                <div class="col pr-0">主讲：${item.teacher_name}</div>
                                <div class="col">报名：${item.has_num} / ${item.limit_num == 0 ? '不限' : item.limit_num}</div>
                            </div>
                            <div class="time small">开课时间：${Poncon.parse_date(item.start_time)}</div>
                        </div>
                    </div>
                </div>`
        })
        return html
    },
    /**
     * 转换时间为剩余时间
     * @param {string} str 时间datatime
     */
    parse_date(str) {
        var timestamp = new Date(str).getTime()
        var now = new Date().getTime()
        var num = timestamp - now
        if (num < 24 * 3.6E6 && num > 0) {
            var hour = Math.floor(num / 3.6E6)
            num -= hour * 3.6E6
            var min = Math.floor(num / 6E4)
            num -= min * 6E4
            var sec = Math.floor(num / 1000)
            return `剩余 ${hour} 小时 ${min} 分钟`
        } else if (num < 0) {
            return '课程已结束'
        } else {
            return str
        }
    },
    /**
     * 加载课程详情
     * @param {string} course_id 课程ID
     */
    load_course_info(course_id) {
        var This = this
        $.post('api/get_course_info.php', {
            username: this.getStorage('username'),
            password: this.getStorage('password'),
            course_id: course_id
        }, function (data) {
            if (data.code == 200) {
                This.load_course_info_html(data.data)
                return
            }
            alert(data.msg)
        })
    },
    load_course_info_html(data) {
        // 判断是否报名
        if (data.baoming) {
            $('.page-info .btn_baoming').html('取消报名')
        } else {
            $('.page-info .btn_baoming').html('立即报名')
        }
        $('.page-info .course_title').html(data.course_name)
        $('.page-info .start_time').html(this.parse_date(data.start_time))
        $('.page-info .teacher_name').html(data.teacher_name)
        $('.page-info .teacher_id').html(data.teacher_id)
        $('.page-info .course_place').html(data.course_place)
        $('.page-info .course_msg').html(data.msg)
        $('.page-info .course_img').attr('src', data.image)
        $('.page-info .baoming_status').html(`${data.has_num} / ${data.limit_num == 0 ? '不限' : data.limit_num}`)
        $('.page-info .btn-calPhone').off().on('click', function () {
            location.href = 'tel:' + data.teacher_id + '#mp.weixin.qq.com'
        })
    },
    /**
     * 点击报名
     */
    click_baoming() {
        if (!confirm('确定操作吗？')) {
            return
        }
        if (!this.loginStatus) {
            alert('请先登录')
            return
        }
        var This = this
        var courseId = location.hash.split('/')[2]
        $.post('api/toggle_course.php', {
            username: this.getStorage('username'),
            password: this.getStorage('password'),
            course_id: courseId
        }, function (data) {
            alert(data.msg)
            if (data.code == 200) {
                This.load_course_info_html(data.data)
                return
            }

        })
    },
    /**
     * 获取我的课程列表
     */
    load_my_course_list() {
        $.post('api/get_user_course_list.php', {
            username: this.getStorage('username'),
            password: this.getStorage('password')
        }, function (data) {
            var list = Array.isArray(data.data) ? data.data : ''
            var html = Poncon.make_list_html(list)
            $('.page-myCourse .courseList').html(html)
        })
    }
}