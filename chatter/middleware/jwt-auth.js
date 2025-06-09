const passport = require('passport');

module.exports = {
  ensureJWTAuthenticated: function (req, res, next) {
    return passport.authenticate("jwt", {
        session: false
    }, (err, user, info) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized user'
            });
        }
        // Forward user information to the next middleware
        req.user = user; 
        next();
    })(req, res, next);
  }
};