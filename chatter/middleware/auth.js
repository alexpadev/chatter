module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        //current_user will be accessible from the views
        res.locals.user = req.user;
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/auth/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return res.redirect("/auth/login");
      }
      next();    
    }
  };