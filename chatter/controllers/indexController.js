var debug = require('debug')('chatter:controllers:indexController');
const Admin = require('../models/Admin');


const IndexController = {
    index:(req, res, next)=>{
        debug('chatter:index:log')
        res.render("index", { title: 'Express' });
    },
}

 module.exports = IndexController;
