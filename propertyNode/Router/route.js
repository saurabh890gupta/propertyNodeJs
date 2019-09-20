const express =require('express');
const router1=express.Router();
const control=require('../Controller/control');
const control2=require('../Controller/control2');
const authModule=require('../Controller/authTokenVeri');
const adminControl=require('../Controller/adminControl')



router1.get('/',control.home);
router1.post('/api/signup',control.Signup);
router1.post('/api/login',control.Login);
router1.get('/api/logout',control.Logout);
router1.post('/api/contactus',authModule.verifyToken,control.Contactus);
router1.post('/api/forgetpassword',control.ForgetPassword);
router1.post("/api/changpassword",control.ChangPassword);
// router1.post('/api/propertysubmit',control.PropertySubmit)
router1.post('/api/Upload',control.uplaod);
router1.get('/api/Fileget', control.fileget);
router1.post('/api/propertydetailsget?', control.PropertyDetailsGet);
router1.get('/api/propertydeleteAll',control.PropertyDeleteAll);
router1.get('/api/exmple',control.Exmple);
router1.get('/api/activateAccount/:email?',control.ActivateAccount); //this use params( /:email) and query(?)
router1.post('/api/searchemail',control.SearchEmail)
router1.post('/api/billingAddress',control.BillingAddress);
router1.post('/api/getAddress',control.GetAddress)
router1.post('/api/payme',control.Payme);
router1.post('/api/deleteUserData',authModule.verifyToken,control.DeleteUserData);
router1.post('/api/updateUserData',control.UpdateUserData);
router1.post('/api/deletePropertyData',control.DeletePropertyData);
router1.post('/api/updatePropertyData',control.UpdatePropertyData);
router1.post('/api/deleteContactData',control.DeleteContactData);
router1.post('/api/updateContactData',control.UpdateContactData);
router1.post('/api/deleteBillingData',control.DeleteBillingData);
router1.post('/api/updateBillingData',control.UpdateBillingData);
router1.post('/api/changePasswordOtp',control.changePasswordOtp);
router1.post('/api/verifyOtpPssword',control.verifyOtpPssword);

//admin api
router1.post('/api/admin',adminControl.Admin);

//control2 api
router1.all('/api/GetDataby',control2.getdataby);
router1.all('/api/passchange',control2.passChange);
router1.post('/api/excelsheet',control2.excelSheet);
router1.post('/api/csvfile',control2.csvFile);
router1.post('/api/fakemail',control2.FakeMail);

// router1.post('/api/formdib',control.Formdib);


module.exports=router1;
                                                                   