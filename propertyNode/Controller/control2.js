//for excle file 
const mongoose=require('mongoose')
//data base coonection require
require('../Config/dbconfig')
//schema require
require('../Database/schema/users')
// model require
const user = mongoose.model('Users');
const Contactus=mongoose.model('Contactus');
var mongoXlsx = require('mongo-xlsx');
var json2xls = require('json2xls');
var fs=require('fs') //for csv file
const { Parser } = require('json2csv'); ///for csv file

module.exports.excelSheet =(req, res)=>{
    console.log("datawww run");
// this for formated data for excel 
    // var excelData =async function(){
    //   var data = await propertyData.find({});
    //   // console.log(data);
    //   var model = mongoXlsx.buildDynamicModel(data);
    //   mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
    //     console.log('File saved at:', data.fullPath); 
    //     res.send({message:"excel file created"})
    //   });
  
    // }; 
  
// this for formated data for excel
    var excelData =async function(){
    var data = await user.find({});
    var xls = json2xls(data,{
        fields: ['_id', 'user_name', 'email', 'password', 'comments']
    });
    
    fs.writeFileSync(__dirname +'/../Uploads/data.xlsx', xls, 'binary');
        console.log("excl creater");
        res.send("excl creater");
    };

  excelData();

}


 
module.exports.csvFile =(req, res)=>{
    var csvData =async function(){
            var data = await user.find({});
            res.send(data);
            var fields = ['_id', 'user_name', 'email', 'password', 'comments'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);
            // fs.writeFile('file.csv', csv, function(err) {
            // if (err) throw err;
            // console.log('file saved');
            // });
            fs.writeFileSync(__dirname +'/../Uploads/data.csv', csv, 'binary');
            console.log("csv creater");
            
    }
csvData();
}

// var formidable = require("formidable");
// module.exports.Formdib=(req,res)=>{
//     var form = new formidable.IncomingForm();

//     form.parse(req);

//     form.on('fileBegin', function (name, file){
//         file.path = __dirname + '/data/' + file.name;
//     });

//     form.on('file', function (name, file){
//         console.log('Uploaded ' + file.name);
//     });

//     return res.json(200, {
// 							result: 'Upload Success'
//     });
// };



const sgMail = require('@sendgrid/mail');
 sgMail.setApiKey('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');
//  sgMail.setApiKey('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')
// by sendGrid send mail for fake
module.exports.FakeMail=(req,res)=>{
    console.log("hel;lo get dat")
    const msg = {
    to: 'mishra.arun18@gmail.com',
    from: 'mishra.arun18@gmail.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail.send(msg).then((res,err)=>{
        console.log("msgv ggggggg",err)
        if(res){
        console.log("msg",res)
        }else{
        console.log("err")
        }
    });

} 

module.exports.testapi=(req,res)=>{
    try{
        if(req.body){
            user.aggregate([{ $match: { "zip": 90210 }}]);
        }else{
            res.send({err:"somthing error in  req.body"})            
        }
    }catch{

    }
}

module.exports.passChange=(req,res)=>{
    var khhh=cryptr.encrypt(req.body.pass);
    var hhhk=cryptr.decrypt(khhh);
    console.log("hhhhhhhhhhhhh", khhh,hhhk);
}

module.exports.getdataby=(req,res)=>{
    var h=[];
    user.find({},{_id:1}).then((results)=>{ //all id find in table
        // user.find({},{email:1}).then((res)=>{  //for id and email
           // user.find().select({ email: 0 }).then((res)=>{ //not incude email all data find
          // user.find({},{_id:0,email:1}).then((res)=>{ //this is use for only email
            console.log("ressssssss",results);
            results.forEach((result)=>{
                h.push(Contactus.findOne({user_id:result._id}))           
            })
            Promise.all(h).then((r)=>{
                let data = r.filter(val => {
                    if(val) return val;
                })
                    // console.log(data,"hjghjg");  
                    res.status(200).send(data);
            })
    })
    
}