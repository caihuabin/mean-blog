exports.isAuthenticated = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        var err = new Error('notAuthenticated');
        err.status = 401;
        next(err);
    }
};
exports.isAuthorized = function(req, res, next) {
    if (req.session.user.role === 'admin') {
        next();
    } else if (req.body.user && req.body.user._id == req.session.user._id) {
        next();
    } else {
        var err = new Error('notAuthorized');
        err.status = 403;
        next(err);
    }
};
exports.isAdmin = function(req, res, next) {
    if (req.session.user.role === 'admin') {
        next();
    } else {
        var err = new Error('notAuthorized');
        err.status = 403;
        next(err);
    }
};
