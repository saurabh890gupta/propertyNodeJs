
var config = require('./config');
var jwt = require('jsonwebtoken');

module.exports.verifyToken=(req,res,next)=>{
    console.log(req.headers.authorization,"fgdfg")
    if(!req.headers.authorization) {
        return res.status(401).send('Unauthorized request')
      }
      let token = req.headers.authorization.split(' ')[1]
      if(token === 'null') {
        return res.status(401).send('Unauthorized request')    
      }
      let payload = jwt.verify(token, config.secret)
      if(!payload) {
        return res.status(401).send('Unauthorized request') 
      }
      req.userId = payload.subject
      next()

}