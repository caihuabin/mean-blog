
router.get('/', function (req, res, next) {
    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('admin/index', {
                settings: settings,
                title: settings['SiteName'] + ' - 网站统计'
            });
        }
    });
});

router.get('/categorymanage', function (req, res, next) {
    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('admin/categorymanage', {
                settings: settings,
                title: settings['SiteName'] + ' - 分类管理'
            });
        }
    });
});

router.post('/getCategories', function (req, res, next) {
    category.getAll(false, false, function (err, data) {
        if (err) {
            next(err);
        } else {
            res.json(data);
        }
    });
});

router.post('/saveCategories', function (req, res, next) {
    var jsonArray = JSON.parse(req.body.json.substr(1, req.body.json.length - 2));
    category.save(jsonArray, function (err) {
        if (err) {
            next(err);
        } else {
            res.end();
        }
    });
});

router.get('/articlemanage', function (req, res, next) {
    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('admin/articlemanage', {
                settings: settings,
                title: settings['SiteName'] + ' - 文章管理'
            });
        }
    });
});

router.post('/getCateFilter', function (req, res, next) {
    category.getAll(true, false, function (err, data) {
        if (err) {
            next(err);
        } else {
            res.json(data);
        }
    });
});

router.get('/comments', function (req, res, next) {
    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('admin/comments', {
                settings: settings,
                title: settings['SiteName'] + ' - 评论管理'
            });
        }
    });
});

router.get('/guestbook', function (req, res, next) {
    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('admin/guestbook', {
                settings: settings,
                title: settings['SiteName'] + ' - 留言管理'
            });
        }
    });
});

router.get('/aboutmanage', function (req, res, next) {
    var ep = new eventproxy();
    ep.all('settings', 'about', function (settings, about) {
        res.render('admin/aboutmanage', {
            title: settings['SiteName'] + ' - 关于管理',
            about: about,
            settings: settings
        });
    });

    tool.getConfig(path.join(__dirname, '../config/about.json'), function (err, about) {
        if (err) {
            next(err);
        } else {
            ep.emit('about', about);
        }
    });

    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            ep.emit('settings', settings);
        }
    });
});

router.post('/saveAbout', function (req, res, next) {
    tool.setConfig(path.join(__dirname, '../config/about.json'), {
        FirstLine: req.body.FirstLine,
        SecondLine: req.body.SecondLine,
        PhotoPath: req.body.PhotoPath,
        ThirdLine: req.body.ThirdLine,
        Profile: req.body.Profile,
        Wechat: req.body.Wechat,
        QrcodePath: req.body.QrcodePath,
        Email: req.body.Email
    });
    res.end();
});

router.get('/cachemanage', function (req, res, next) {
    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('admin/cachemanage', {
                settings: settings,
                title: settings['SiteName'] + ' - 缓存管理'
            });
        }
    });
});

router.post('/getcache', function (req, res, next) {
    redisClient.getItem(req.body.key, function (err, data) {
        if (err) {
            next(err);
        } else {
            if (data) {
                res.json(data);
            } else {
                res.end();
            }
        }
    })
});

router.post('/clearcache', function (req, res, next) {
    redisClient.removeItem(req.body.key, function (err) {
        if (err) {
            next(err);
        } else {
            res.end();
        }
    })
});

router.get('/exception', require('connect-ensure-login').ensureLoggedIn(), function (req, res, next) {
    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('admin/exception', {
                settings: settings,
                title: settings['SiteName'] + ' - 异常管理'
            });
        }
    });
});

router.post('/getExceptions', function (req, res, next) {
    var ep = new eventproxy(),
        params = {
            pageIndex: req.body.pageNumber,
            pageSize: req.body.pageSize,
            sortName: req.body.sortName,
            sortOrder: req.body.sortOrder
        };

    ep.all('logs', 'count', function (logs, count) {
        var result = [];
        logs.forEach(function (item) {
            result.push({
                message: item.message,
                time: tem.timestamp,
                level: item.level,
                meta: item.meta
            });
        });
        res.json({
            rows: result,
            total: count
        });
    });

    log.getAll(params, function (err, logs) {
        if (err) {
            next(err);
        } else {
            ep.emit('logs', logs);
        }
    });

    log.getAllCount(params, function (err, count) {
        if (err) {
            next(err);
        } else {
            ep.emit('count', count);
        }
    })
});

router.get('/settings', function (req, res, next) {
    tool.getConfig(path.join(__dirname, '../config/settings.json'), function (err, settings) {
        if (err) {
            next(err);
        } else {
            res.render('admin/settings', {
                settings: settings,
                title: settings['SiteName'] + ' - 系统设置'
            });
        }
    });
});

router.post('/saveSettings', function (req, res, next) {
    tool.setConfig(path.join(__dirname, '../config/settings.json'), {
        SiteName: req.body.SiteName,
        SiteDomain: req.body.SiteDomain,
        RecordNo: req.body.RecordNo,
        LogoPath: req.body.LogoPath,
        PageSize: req.body.PageSize,
        ExpandMenu: req.body.ExpandMenu,
        CacheExpired: req.body.CacheExpired,
        TranslateKey: req.body.TranslateKey,
        EnableStatistics: req.body.EnableStatistics,
        StatisticsId: req.body.StatisticsId,
        EnableShare: req.body.EnableShare,
        JiaThisId: req.body.JiaThisId,
        ShowComments: req.body.ShowComments,
        ChangyanId: req.body.ChangyanId,
        ChangyanConf: req.body.ChangyanConf,
        ShowGuestbook: req.body.ShowGuestbook,
        YouyanId: req.body.YouyanId
    });
    res.end();
});
