const mongoose=require('mongoose')

//data base coonection require
require('../Config/dbconfig')

//schema require
require('../Database/schema/users')
require('../Database/schema/contactus')
require('../Database/schema/propertydata')
require('../Database/schema/userBillingAddress')

// model require
const user = mongoose.model('Users');
const Contactus=mongoose.model('Contactus');
const propertyData=mongoose.model('propertySchema');
const BillingAddress=mongoose.model('BillingAddress');


// for sigup use
var bcrypt = require('bcryptjs');
var saltRounds=10;
var async = require("async");
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config');
var upload=require('./upload');
var nodemailer = require('nodemailer');
const path   = require('path');
var Cryptr=require('cryptr');
cryptr=new Cryptr('devnami');

//service module require
var services=require('./services');

const keyPublishable = 'pk_test_GJR0iwIfVvYV5GDXkEeVxre2009TD5qmrX';
const keySecret = 'sk_test_Xy2CBKqtHE9bjrihdYc42fja00Vr3PZr0N';
var stripe = require('stripe')(keySecret);


module.exports.home=(req,res)=>{
    console.log("home ejs file")
    res.render('home');
}

module.exports.Signup=(req,res)=>{
    console.log("req accept",req.body);
    try{
        if(req.body.email==''){
            console.log("inside")
            return res.send({error:"email id required"})
        }
        else{
            user.findOne({email:req.body.email}).then((result)=>{
                console.log("user result",result);  
                if(result!=null){
                    return res.send({result:"user exist"})
                }else{
                    bcrypt.hash(req.body.pass,  saltRounds, function(err, hash) {
                        if(err){
                            return res.status(404).json({error: "password not found"});
                        }
                        else{
                            if(req.body.remember==''){
                                req.body.remember=false;
                            }
                            async.series({
                                user : function(callback){
                                    const mydata = {
                                        user_name: req.body.name,
                                        email: req.body.email,
                                        password: hash,
                                        repeatpassword: hash,
                                        comments: [{email: req.body.email , pincode:"210427"}],
                                        remember: req.body.remember, 
                                        account_status:0,  
                                    }
                                    new user(mydata).save().then((data)=>{
                                            
                                        var token = jwt.sign({ id: data._id }, config.secret, {
                                            expiresIn: 86400 // expires in 24 hours
                                        });
                                        res.status(200).send({ auth: true, token: token,result:'signup successful'});
                                        console.log('succefull data');
                                        var transporter = nodemailer.createTransport({
                                            
                                          //its comment for heroku app deploye  
                                            // host: 'smtp.gmail.com',
                                            // port: 465,
                                            // secure: true,
                                            // auth: {
                                            //     user: 'youremai@gmail.com', // Your email id
                                            //     pass: 'pwd123' // Your password
                                            // },
                                            // tls: {
                                            //     // do not fail on invalid certs
                                            //     rejectUnauthorized: false
                                            // }
                                            service: 'gmail',
                                            auth: {
                                                    user: 'jssaurabh.gupta786@gmail.com',
                                                    pass: 'Kumar@123'
                                               }
                                        });
                                        var maillist=[mydata.email, 'jssaurabh.gupta786@gmail.com'];
                                        const mailOptions = {
                                            from: 'jssaurabh.gupta786@gmail.com', // sender address
                                            to: maillist, // list of receivers
                                            subject: 'Sending Email using saurabhProperty',
                                            text: 'you are success fully signup! in "" ',
                                            //   + mydata.email + "your password : "+req.body.pass,
                                            html:'<p>Hello '+mydata.user_name+'</p><p>your user_id and password for <strong>Gero Estate<strong></p><p>Your Email: <span> '+ mydata.email+'</span></p><p>your password :<span>'+req.body.pass+'</span></p><a style="border:1px solid gray;color:white; border-radius:4px; padding-top:10px;padding-bottom:10px;padding-left:5px;padding-right:5px; text-decoration:none;;background-color:#ff8000;" href="http://localhost:5050/api/activateAccount/'+mydata.email+'?account_status='+1+'" >Activate your Account</a> <p>  </p>'
                                        };                                                                                                                                                                                                                                                                                                                                                                                                               //http://localhost:5050/api/activateAccount?account_status='+1+'&'+'email='+mydata.email+'"  for query parameter
                                        transporter.sendMail(mailOptions, function (err, info) {
                                        if(err)
                                           {
                                            console.log('error to send mail',err);
                                           }
                                        else{
                                            console.log('Email sent: ' + info.response);
                                        }
                                        });
                                    }).catch((error)=>{
                                        console.log("data not save")
                                        return res.status(401).json({error: error});
                                    })
                                }         
                            })
                        }
                    });
                }
            }).catch((error)=>{
                return res.status(401).json({error: error});
            })
        }
    }
    catch(err){
        return res.status(401).json({error: err});
    }
}
module.exports.ActivateAccount=(req,res)=>{ //http://localhost:5050/api/activateAccount/saurabh.gup890@gmail.com?account_status=1  {this is url for send data using params}
                                             //http://localhost:5050/api/activateAccount?account_status='+1+'&'+'email='+mydata.email+'"  
    console.log("login body",req.query);            //for postman ===> http://localhost:5050/api/activateAccount?account_status=1&age=23
    console.log("path pass",req.params);
    try{
        if(req.query.account_status&&req.params.email){
            user.updateOne({email:req.params.email},{$set:{account_status:req.query.account_status}}).then((result)=>{
                if(result){
                    console.log("your account activate")
                    return res.send('your account activate you can login now');
                }
                else{
                    console.log("your account not activate")
                    return res.send({err:'somthing went to error'});
                }
            })
        } 
        else{
            return res.send({message:'data not found'});
        }  
    }catch(err){
        return res.status(401).json({error: err});
    }

}
module.exports.Login=(req,res)=>{
    
    console.log("login body",req.body,req.formData)
    try{
        if(!req.body.email||!req.body.password){
            res.send({error:"email or password necessary"})
            return false;
        }
        else{
            user.findOne({email:req.body.email}).then((result)=>{
                console.log("result find",result)
                const user_data={
                    user_id:result._id,
                    user_name:result.user_name,
                    email: result.email,
                    account_status:result.account_status
                }
            
                if(result!=null){
                    console.log("result find password",result.password)
                    if(result.account_status==0){
                        return res.send({message:'your account not activate'});
                    }else{
                        bcrypt.compare(req.body.password,result.password,(error,result)=>{
                            console.log("result find bcrypt",result,error);
                            if(result){
                                console.log("Sam", result);
                                var token = jwt.sign({ id: result._id }, config.secret, {
                                    expiresIn: 86400 // expires in 24 hours
                                });
                                console.log("tokennnnnnnnnnnnn",token)
                                res.status(200).send({ auth: true, token: token,data:'login successful' ,user_data});      
                            }
                            else{ 
                                return res.send({message:'password not match'});
                            }
                        })  
                    }
                }else{
                    return res.status(404).send({message:"email not found"})
                }
            }).catch((err)=>{
                return res.status(401).json({error:err})
            })  
        }
    }
    catch(err){
        return res.status(401).json({error:err});
    }
}


module.exports.Logout=(req,res)=>{

    console.log(req.session);
    try{
        req.session.destroy(function (err){
            if (err) {
                console.log(err);
                res.send({
                    error:err.message,
                     res
                    });
            }
            else {
                //res.send('User logged out successfully!', res, {});
                res.send({data:"User logged out successfully!"});
            }
        });
    }
    catch(err){
        return res.status(401).json({error:err});
    }
}
module.exports.Contactus=(req,res)=>{
    console.log("hello data send",req.body)
    try{
      async.series({
        Contactus:function(callback){
            const formData = {
                name: req.body.name,
                email: req.body.email,
                contact: req.body.contact,
                address: req.body.address,
                query: req.body.query,
                user_id:req.body.user_id,
            }
            new Contactus(formData).save().then((data)=>{
                if(data){
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'jssaurabh.gupta786@gmail.com',
                            pass: 'Kumar@123'
                        }
                    });
                    var maillist = [formData.email, 'jssaurabh.gupta786@gmail.com'];
                    var mailOptions = {
                        from: 'jssaurabh.gupta786@gmail.com',
                        to: maillist,
                        subject: 'Sending Email using saurabhProperty',
                        text: 'contact by ' + formData.email + " " + " " + formData.contact,

                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    return res.status(200).send({data:"success full save contact"});
                }
                else{
                    return res.status(401).json({error:err});
                }
            })
        }
      })
    }
    catch(err){
        return res.status(401).json({error:err});
    }
}
var btoa = require('btoa');
module.exports.ForgetPassword=(req,res)=>{
    console.log("ForgetPassword body",req.body.email)
    try{
        console.log("ForgetPassword body12",req.body.email)
        user.findOne({email:req.body.email}).then((data)=>{
            console.log("Forget data",data)
            if(data!=null){
                //mail varifie
                 let encrypt = btoa(data.email);
                console.log("let encrypt", encrypt)
                console.log("ForgetPassword body12s",data)
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'jssaurabh.gupta786@gmail.com',
                        pass: 'Kumar@123'
                    }});
                var maillist = [data.email, 'jssaurabh.gupta786@gmail.com'];
                var mailOptions = {
                    from: 'jssaurabh.gupta786@gmail.com',
                    to:  maillist,
                    subject: 'Sending Email using Node.js',
                    text: 'you change your password!',
                    // html: '<b>Hello world?</b><br><a href="http://localhost:4200/changepassword?email='+data.email+'">My web</a>'
                    html: '<b>Hello world?</b><br><a href="http://localhost:4200/changepassword?email='+encrypt+'">My web</a>'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        var date2 = new Date();
                        var linkTime=date2.valueOf()
                        console.log("ggggg",linkTime);
                        user.updateOne({email:req.body.email},{$set:{linkTime:linkTime,linkFlag:true}}).then((result)=>{
                            if(result){
                                console.log("linktime and link update"); 
                            }
                            else{
                                console.log("somthing problem to link time updaet"); 
                            }
                        }).catch((err)=>{
                            console.log("error to update data");
                        })
                        console.log('Email sent: ' + info.response);
                    }
                });
                return res.status(200).send({res:"user exist"});
            }
            else{
                // return res.status(404).send({err:"user not exist"});
                return res.send({err:"user not exist"});
            }

        }).catch((err)=>{
            return res.status(401).json({error:"email find error"});
        })
    }catch(err){
        return res.status(401).json({error:err});
    }
}

module.exports.ChangPassword=(req,res)=>{
    console.log("ChangPassword data find",req.body,req.query,req.body.email)
    try{
        if(req.body.email&&req.body.pass&&req.body.repeatpass){
            user.findOne({email:req.body.email,linkFlag:true}).then((data)=>{
                if(data!=null){
                    var otpTimeDiff=services.timediffertent(data.linkTime);
                    console.log("tesing answer",otpTimeDiff);
                   if(otpTimeDiff<=15){
                        bcrypt.hash(req.body.pass,  saltRounds, function(err, hash) {
                            user.updateOne({email:req.body.email},{ $set : {password:hash,repeatpassword:hash,linkFlag:false}}).then((result)=>{
                                console.log("password chang result find",result);
                                if(result!=null){
                                    return res.status(200).send({res:"this user found",message:"your password change"});
                                }else{
                                    return res.send({err:"this user not found"}); 
                                }

                            }).catch((err)=>{
                                return res.status(401).json({error:err,message:"somthing update wrong"}); 
                            })
                            
                        })
                    }
                    else{
                        return res.send({err:"your change password time expired"});
                    }
                }
                else{
                    return res.send({err:"this user not found"});
                }
            }).catch((err)=>{
                return res.status(401).json({error:"user find error"});
            })
        }
        else
        {
            return res.status(401).json({error:"all fields are required"}); 
        }
    }
    catch(err){
        return res.status(401).json({error:"somthing went to wrong"});   
    }
}

// module.exports.uplaod=(req,res,err)=>{
//     //  console.log("property data find",req.body,)
//     try{
//         upload(req, res, (err) => {
      
//             //  console.log("inside upload",req.body,file)
//             if (err) {
//                 res.render('home', {
//                     msg: err
//                 });
//             }
//             else {
//                 if (req.file == undefined) {
//                     res.render('home', {
//                         msg: 'Error: no file selected!'
//                     });
//                 }
//                 else {
//                     var fullPath = 'uploads/' + req.file.filename;
//                     // console.log("justrifie data",typeof(fullPath))
//                     // console.log("full path",fullPath,)
//                     // console.log("data inside way append for q",req.body)
//                     var helthPath='public/'+fullPath
//                     // console.log("image path",helthPath)
//                     const formData = {
//                         propertyimage:helthPath,
//                         propertyname:req.body.propertyname,
//                         propertyprice: req.body.propertyprice,
//                         phone: req.body.phone,
//                         propertydescreption: req.body.propertydescreption,
//                         propertystate: req.body.propertystate,
//                         propertycity: req.body.propertycity,
//                         propertystatus: req.body.propertystatus,
//                         propertyleaseperioud: req.body.propertyleaseperioud,
//                         propertyminbed: req.body.propertyminbed,
//                         propertyarea: req.body.propertyarea,
//                         propertySwimmingpool: req.body.propertySwimmingpool,
//                         propertyStories: req.body.propertyStories,
//                         propertyexit: req.body.propertyexit,
//                         propertyFireplace: req.body.propertyrireplace,
//                         propertylaundryroom: req.body.propertylaundryroom,
//                         propertyJogpath: req.body.propertyJogpath,
//                         propertyCeilings: req.body.propertyCeilings,
//                         propertyDualsink: req.body.propertyDualsink,
//                         propertyVideo1: req.body.propertyVideo1,
//                         propertyVideo2: req.body.propertyVideo2,
//                         propertyVideo3: req.body.propertyVideo3,
//                         // checkBox: req.body.checkBox,
//                     }
//                     new propertyData(formData).save().then((result)=>{
//                         // console.log("save data result",result)
//                         if (result) {
                           
//                             res.send({err:"somthing error to send"}) 
//                         }else{
//                             console.log("send data result",result)
//                             res.send({res:result})
//                         }
//                     }).catch((error)=>{
//                         res.send({err:"somthing error to store data",error:error}) 
//                     })
    
//                 }
//             }
//         });
//     }
//     catch(err){
//         return res.status(401).json({error:"somthing went to wrong"});
//     }
// }




module.exports.uplaod=(req,res)=>{
    //  console.log("property data find",req.body,)
    try{
        upload(req, res, (err) => {
            // console.log("inside upload",req.body,file)
                console.log("inside upload",req.files)
                    var jas=[];
                    jas=req.files;
                    console.log("jas jas",jas)
                    var kjs=[];
                    var profileImage=[]
                    console.log("kal vakla",jas)
                    jas.forEach((data,index)=>{
                        console.log("hello get data",index)
                        if(index ==0){
                            console.log("hello");
                            profileImage.push(data.path)
                        }
                        else{
                        kjs.push(data.path);
                        }
                    })
                    console.log("sattel getale",kjs,kjs[0],profileImage[0]);
                    // var fullPath = 'uploads/' + req.file.filename;
                    // console.log("justrifie data",typeof(fullPath))
                    // console.log("full path",fullPath,)
                    // var helthPath='public/'+fullPath
                    //  console.log("image path",helthPath)
                    const formData = {
                        propertyimage:profileImage[0],
                        propertyname:req.body.propertyname,
                        propertyprice: req.body.propertyprice,
                        phone: req.body.phone,
                        propertydescreption: req.body.propertydescreption,
                        propertystate: req.body.propertystate,
                        propertycity: req.body.propertycity,
                        propertystatus: req.body.propertystatus,
                        propertyleaseperioud: req.body.propertyleaseperioud,
                        propertyminbed: req.body.propertyminbed,
                        propertyarea: req.body.propertyarea,
                        propertySwimmingpool: req.body.propertySwimmingpool,
                        propertyStories: req.body.propertyStories,
                        propertyexit: req.body.propertyexit,
                        propertyFireplace: req.body.propertyrireplace,
                        propertylaundryroom: req.body.propertylaundryroom,
                        propertyJogpath: req.body.propertyJogpath,
                        propertyCeilings: req.body.propertyCeilings,
                        propertyDualsink: req.body.propertyDualsink,
                        propertyShowImage:kjs,
                        propertyVideo1: req.body.propertyVideo1,
                        propertyVideo2: req.body.propertyVideo2,
                        propertyVideo3: req.body.propertyVideo3,
                        user_id:req.body.user_id,
                        // checkBox: req.body.checkBox,
                    }
                    console.log("form dataa ",formData)
                    new propertyData(formData).save().then((result)=>{
                        console.log("save data result",result)
                        if (result) {
                           
                            res.send({err:"somthing error to send"}) 
                        }else{
                            console.log("send data result",result)
                            res.send({res:result})
                        }
                    }).catch((error)=>{
                        res.send({err:"somthing error to store data",error:error}) 
                    })
        });
    }
    catch(err){
        return res.status(401).json({error:"somthing went to wrong"});
    }
}

module.exports.fileget = (req, res) =>  {
    console.log("query params",res.query)
    try{
    propertyData.find({}).then((result)=>{
        console.log("daata",result)
        // console.log("image length",result.length)
        //     let urls=result.map(x=>{
        //         console.log(x.propertyimage)
        //         return path.join('public/'+x.propertyimage,
        //         )
        //     });
         res.send({res:result})
    }).catch((err)=>{
        res.send({res:"somthing went wrong"})
    })
    }
    catch(err){
        return res.status(401).json({error:"somthing went to wrong"});
    }
}

module.exports.PropertyDeleteAll=(req,res)=>{
    try{
        propertyData.deleteMany({}).then((data)=>{
        if(data){
            console.log("dataaaaaaaa",data)
            return res.send({data:"delete data"})
        }else{
            console.log("dataaaaaaaa",data)
            return res.send({err:"not any thingdelete data"})
        }
        })
    }
    catch(err){
        return res.status(401).json({error:"somthing went to wrong"});   
    }
}

module.exports.PropertyDetailsGet=(req,res)=>{
    console.log("query params",req.query['_id']);
    try{
        propertyData.find({_id:req.query['_id']}).then((result)=>{
            console.log("daata",result)
            // console.log("image length",result.length)
            //     let urls=result.map(x=>{
            //         console.log(x.propertyimage)
            //         return path.join('public/'+x.propertyimage,
            //         )
            //     });
             res.send({res:result})
        }).catch((err)=>{
            res.send({res:"somthing went wrong"})
        })
        }
        catch(err){
            return res.status(401).json({error:"somthing went to wrong"});
        }

}

module.exports.SearchEmail=(req,res)=>{
    console.log(req.body.email);
    try{
        user.findOne({email:req.body.email}).then((data)=>{
            console.log("helll search bar",data)
            if(data){
                return res.send({message:"successfully found user",})
            }else{
                return res.send({message:"user not found"});
            }
        })
    }catch(err){
        return res.status(401).json({error:"somthing went to wrong"});
    }
}

module.exports.BillingAddress=(req,res)=>{
    console.log("FISRT GET ",req.body,req.query.user_id);
    try{
        async.series({
            BillingAddress : function(callback){
                const billingData = {
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    mobile:req.body.mobile,
                    address:req.body.address,
                    city:req.body.city,
                    state:req.body.State,
                    postcode:req.body.postcode,
                    country:req.body.country,
                    paymentMode:req.body.paymentMethod,
                    termCondition:req.body.termCondtion,
                    user_id:req.query.user_id,
                   
                }
                new BillingAddress(billingData).save().then((resultBilling)=>{ 
                    if(resultBilling){
                        console.log("Billing DATA",resultBilling)
                        res.send({data:resultBilling})
                    }
                    else{
                        res.send({error:"data not found"})
                    }
                }).catch((error)=>{
                    res.send({error:"somthing went to wrong"})
                })
            }
        })
    }catch{
        res.send({error:"data process bed"})
    }

}

module.exports.GetAddress=(req,res)=>{
    console.log("GetAddress_id",req.query.address_id);
    try{
        BillingAddress.findOne({_id:req.query.address_id}).then((result)=>{
            if(result){
                res.send({data:result,res:'succfully data send'})
            }else{
                res.send({error:"result not find"})
            }
        })
    }catch{
        res.send({error:"somthing went to wrong"})
    }
}


module.exports.Payme=(req,res)=>{
    console.log("body for payment",req.body.id)
        stripe.customers.create({email:'sau@gmail1.com',name:'kumar',phone:8999080000},function(err, customer) {
            // console.log('err',err,'0000res',customer);
            res.send({result:customer.id})
            if(customer.id){
                console.log("hello data",customer.id)
                stripe.tokens.create({card: { number: '5200828282828210', exp_month: 11, exp_year: 2021, cvc: '123'}},function(err, token) {
                    console.log("tokendata",customer.id ,token.id,token.card.id);
                    if(customer.id && token.id){
                        // console.log("inside if condition",customer.id,token.id)
                        stripe.customers.createSource(customer.id,{source: token.id},function(err, source) {
                            console.log("source",source.id)
                        stripe.charges.create({
                            amount: 2000,
                            currency: "usd",
                            customer:customer.id,
                             // obtained with Stripe.js
                            card:source.id,
                            description: "Charge for saurabh.gup890@gmail.com"
                          }, function(err, charge) {
                           console.log(charge,"get")
                          });

                        });
                      
                    }
                });
            }
        });
}


//all find id 
// module.exports.getdataby=(req,res)=>{
//     user.find({},{_id:1}).then((res)=>{ //all id find in table
//         // user.find({},{email:1}).then((res)=>{  //for id and email
//            // user.find().select({ email: 0 }).then((res)=>{ //not incude email all data find
//           // user.find({},{_id:0,email:1}).then((res)=>{ //this is use for only email
//            console.log("ressssssss",res);
//         res.forEach((result)=>{
//             Contactus.find({user_id:result._id}).then((redata)=>{
//                 console.log("hello",redata);
//             })

//         })
//     })
    
// }

module.exports.Exmple=(req,res)=>{
    try{
        async.series({
            user: function(callback){
                setTimeout(function(){
                    user.find().then((result)=>{
                        callback(null, result);

                    })
                    
                }, 400);
            },
            contactus: function(callback){
                setTimeout(function(){
                    Contactus.find().then((data)=>{
                        callback(null, data);
                    })
                    
                }, 300);
            },
            property: function(callback){
                setTimeout(function(){
                    propertyData.find().then((red)=>{
                        callback(null, red);
                    })
                    
                }, 200);
            },
            billingData:function(callback){
                setTimeout(function(){
                    BillingAddress.find().then((biiling)=>{
                        callback(null,biiling)
                    })
                },100);
            }
        },
        function(err, results) {
            // results is now equals to: {one: 1, two: 2}
            if(results){
                console.log("hello data",results )
                res.send(results)
            }
            else{
                console.log("hello data somthing error" )
                res.send({err:"somthinfg err"})
            }
            
        });
    }
    catch{
      res.send({err:"somthinfg err found"})
    }
}

module.exports.DeleteUserData=(req,res)=>{
    try{
        console.log("req user id",req.query.user_id)
        user.deleteOne({_id:req.query.user_id}).then((result)=>{
            if(result){
                    console.log("data delete resu;lt",result)
                    res.send({res:result,message:"data delete successfull"})
            }else{
                console.log("data not delete resu;lt",result)
                res.send({res:result,message:"data not delete"})
            }
        })
    }
    catch{
        res.send({message:"somthing went to error"})  
    }
}
 
module.exports.UpdateUserData=(req,res)=>{
    console.log("userUpdateDATA",req.body);

    try{
        if(req.body){
            user.updateOne({_id:req.body._id},{ $set : {email:req.body.email, user_name:req.body.user_name ,address:req.body.address,account_status:req.body.account_status}}).then((result)=>{
                if(result){
                     console.log("update data",result);
                     
                        res.send({res:result,message:"update successfully"})
                }else{
                    res.send({message:"update not successfully"})
                }
            })
        }else{
            res.send({error:"somthing problem"})
        }
    } 
    catch{
        res.send({error:"somthing problem in data"})    
    }


}
module.exports.DeletePropertyData=(req,res)=>{
    try{
        console.log("req user id",req.query.property_id)
        propertyData.deleteOne({_id:req.query.property_id}).then((result)=>{
            if(result){
                    console.log("data delete resu;lt",result)
                    res.send({res:result,message:"data delete successfull"})
            }else{
                console.log("data not delete resu;lt",result)
                res.send({res:result,message:"data not delete"})
            }
        })
    }
    catch{
        res.send({message:"somthing went to error"})  
    }
}
module.exports.UpdatePropertyData=(req,res)=>{
    console.log("UpdatePropertyData",req.body);
    try{
        if(req.body){
            propertyData.updateOne({_id:req.body.propertyId},{ $set : { propertyprice:req.body.propertyprice,propertystatus:req.body.propertystatus, propertyname:req.body.propertyname ,propertyarea:req.body.propertyarea,propertycity:req.body.propertycity}}).then((result)=>{
                if(result){
                     console.log("update data",result);
                     
                        res.send({res:result,message:"update successfully"})
                }else{
                    res.send({message:"update not successfully"})
                }
            })
        }else{
            res.send({error:"somthing problem"})
        }
    } 
    catch{
        res.send({error:"somthing problem in data"})    
    }
}
module.exports.DeleteContactData=(req,res)=>{
    try{
        console.log("req user id",req.query.contact_id)
        Contactus.deleteOne({_id:req.query.contact_id}).then((result)=>{
            if(result){
                    console.log("data delete resu;lt",result)
                    res.send({res:result,message:"data delete successfull"})
            }else{
                console.log("data not delete resu;lt",result)
                res.send({res:result,message:"data not delete"})
            }
        })
    }
    catch{
        res.send({message:"somthing went to error"})  
    }
}
module.exports.UpdateContactData=(req,res)=>{
    console.log("UpdateContactData",req.body);
    try{
        if(req.body){
            Contactus.updateOne({_id:req.body._id},{ $set : { name:req.body.name,email:req.body.email, contact:req.body.contact ,address:req.body.address,query:req.body.query}}).then((result)=>{
                if(result){
                     console.log("update data",result);
                     
                        res.send({res:result,message:"update successfully"})
                }else{
                    res.send({message:"update not successfully"})
                }
            })
        }else{
            res.send({error:"somthing problem"})
        }
    } 
    catch{
        res.send({error:"somthing problem in data"})    
    }
}
module.exports.DeleteBillingData=(req,res)=>{
    try{
        console.log("req user id",req.query.contact_id)
        BillingAddress.deleteOne({_id:req.query.billing_id}).then((result)=>{
            if(result){
                    console.log("data delete resu;lt",result)
                    res.send({res:result,message:"data delete successfull"})
            }else{
                console.log("data not delete result",result);
                res.send({res:result,message:"data not delete"});
            }
        })
    }
    catch{
        res.send({message:"somthing went to error"})  
    }
}
module.exports.UpdateBillingData=(req,res)=>{
    console.log("UpdatebillingData",req.body);
    try{
        if(req.body){
            console.log("inside if condition");
            BillingAddress.updateOne({_id:req.body._id},{ $set : { firstName:req.body.firstName,lastName:req.body.lastName, mobile:req.body.mobile ,address:req.body.address,city:req.body.city,state:req.body.state,postcode:req.body.postcode,country:req.body.country}}).then((result)=>{
                if(result){
                     console.log("update data",result);
                     
                        res.send({res:result,message:"update successfully"})
                }else{
                    res.send({message:"update not successfully"})
                }
            })
        }else{
            res.send({error:"somthing problem"})
        }
    } 
    catch{
        res.send({error:"somthing problem in data"})    
    }
}

module.exports.changePasswordOtp=(req,res)=>{
    console.log("hello",req.query)
    try{
        if(req.query.email==""){
            console.log("email not find");
            res.send({error:"email required"})
            return false;
        }
        else{
            user.findOne({email:req.query.email}).then(async (result)=>{ //this async usae for comment await for wait send email result
                if(result){
                    var date2 = new Date();
                    var otpTime=date2.valueOf()
                    var otp=services.generateOTP();
                    // console.log("ggggg",otpTime,otp); 
                    var sendMsg={
                        email:req.query.email,
                        html:'<p><strong>otp valid for 15 min</strong></p></br>'+'<p><strong style="color:red">your otp is</strong> : '+otp+'</p>'
                    }
            // let result=await services.emailSend(sendMsg) this for wait responce
                    services.emailSend(sendMsg).then((result)=>{
                           console.log("mail send succeffully",result)
                    })
                    console.log("hello send msg")
                    user.updateOne({email:req.query.email},{$set:{otp:otp,otpTime:otpTime}}).then((data)=>{
                        if(data){
                            res.send({message:"otp send in mail"})
                        }
                        else{
                            res.send({message:"problem save otp"})
                        }
                    })
                }
                else{
                    res.send({message:"email find error for otp"})  
                }  
            })
        }
    }catch{
        res.send({error:"somthing problem send otp"})    
    }
}

module.exports.verifyOtpPssword=(req,res)=>{
    console.log("hello data",req.body)
    try{
        if(req.body){
                user.findOne({email:req.body.email,otp:req.body.otp}).then((data)=>{
                    console.log("data aya",data)
                    if(data){
                        var otpTimeDiff=services.timediffertent(data.otpTime);
                        if(otpTimeDiff<=15){
                            console.log("hello get data");
                                bcrypt.hash(req.body.password,  saltRounds, function(err, hash) {
                                    console.log(hash,"hash hash hash")
                                    user.updateOne({email:req.body.email},{$set:{password:hash,repeatpassword:hash}}).then((data)=>{
                                        if(data){
                                            console.log(data,"updatedata in")
                                            res.send({message:"password change successfully"});
                                        }
                                        else{
                                            res.send({error:"somthing update problem"})   
                                        }
                                     })
                                })
                        }
                        else{
                            console.log("otp session expired")
                            res.send({error:"otp session expired"})   
                        }
                    }
                    else{
                        res.send({error:"otp not match"})  
                        return false;
                    }
                })
        }else{
            res.send({error:"somthing problem reqbody"})  
        }
    }catch{
        res.send({error:"somthing problem coming data"})  
    }
}

      