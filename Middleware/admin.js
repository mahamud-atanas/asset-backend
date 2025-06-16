module.exports = function(req , res , next) {
    if(!req.user.role) return res.status(403).send('Access deniedaaa');
    next();
}