history.scrollRestoration = 'manual'
$(document).ready(function () {
    if (!Poncon.login(true)) {
        location.hash = '/login'
    }
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
            history.replaceState({}, null, './')
            document.title = '我的课程 - ' + Poncon.title
        } else if (target == 'login') {
            document.title = (hash[2] == 'register' ? '教师注册' : '教师登录') + ' - ' + Poncon.title
            $('.page-sub').css('display', 'none')
            $('.page-sub-' + (hash[2] == 'register' ? 'register' : 'login') + '').css('display', 'block')
        } else if (target == 'add') {
            document.title = '新增课程 - ' + Poncon.title
            if (!Poncon.load.add) {
                Poncon.load_course_types()
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
    $('.file_jhsgdh').change(function () {
        var fileData = $(this).prop('files')
        Poncon.upload(fileData[0])
        $(this).val('')
    })
})

const Poncon = {
    title: '教师端',
    storageKey: 'yzetmy_teacher', // 本地存储键名
    data: {
        add: {}
    },
    load: {}, // 页面初始化加载完成情况，pageName: true/false
    tempTitle: {}, // 用于必要时记录页面标题
    request: $.post('api/empty.php'),
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
                        location.hash = ''
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
            password: md5(password)
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
     * 点击上传图片
     */
    click_upload() {
        var Page = $('.page-add')
        Page.find('input.file_jhsgdh').click()

    },
    /**
     * 开始上传文件
     */
    upload(fileData) {
        if (fileData.size > 1048576) {
            alert('图片不能大于1MB，请压缩后上传')
            return
        }
        var This = this
        var formData = new FormData()
        formData.append('file', fileData)
        formData.append('name', fileData.name)
        formData.append('puid', 19673665)
        formData.append('_token', '7347af7b58c7297d1398035f530c4155')
        $.ajax({
            method: 'post',
            url: '//pan-yz.chaoxing.com/upload/uploadfile',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            dataType: 'json',
            error: function (e) {
                alert('出错：' + e.statusText)
            },
            success: function (data) {
                var image_url = 'https://img.apee.top/i/' + data.data.residstr
                This.data.add.image_url = image_url
                $('._jhsgdfhsghf').attr('src', image_url).show()
            }
        })
    },
    /**
     * 加载课程分类选项列表
     */
    load_course_types() {
        $.get('api/course_types.json', function (data) {
            Poncon.data.add.courseTypes = data
            var html = ''
            data.forEach(item => {
                html += `<option value="${item.courseTypeId}">${item.courseType}</option>`
            })
            $('.page-add ._jhsghd').html(html)
        })
    },
    /**
     * 点击新增课程
     */
    click_addCourse() {
        var Page = $('.page-add')
        var courseName = Page.find('.input-courseName').val()
        var courseType = Page.find('.input-courseType').val()
        var startTime = Page.find('.input-startTime').val()
        var coursePlace = Page.find('.input-coursePlace').val()
        var limitNum = Page.find('.input-limitNum').val()
        var msg = Page.find('.input-msg').val()
        if (!courseName || !courseType || !startTime || !coursePlace || !this.data.add.image_url) {
            alert('请将带星号的项目填写完整')
            return
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
        }
        var This = this
        $.post('api/add_course.php', data, function (data) {
            alert(data.msg)
            if (data.code == 200) {
                location.hash = ''
                This.click_clean()
                return
            }
        })
    },
    /**
     * 新增课程页面，点击清空表单
     */
    click_clean() {
        var Page = $('.page-add')
        Page.find('input').val('')
        delete this.data.add.image_url
        $('._jhsgdfhsghf').removeAttr('src').hide()
    }
}