var path = require("path");
var rootDir = require("./../util/path.js");
var User = require("./../models/user.js")
var bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {validationResult} = require("express-validator");

const sendgridTransport = require("nodemailer-sendgrid-transport");

const GetUserLoginPage = (req,res) => {
  res.render(path.join(rootDir,"views","user","login.ejs"),{
    userInput:{
      email:"",
      password:""
    },
    validationErrors:[]

  });
}

const transporter = nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key:"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"
  }
}));



const PostUserLogin = (req,res,next) => {

  var username = req.body.username;
  var password = req.body.password;

  var errors = validationResult(req);
  if(errors.isEmpty()){
    User.findOne({email:username}).then((found_user)=>{
      if(found_user){
        bcrypt.compare(password,found_user.password).then((isFound)=>{
          if(isFound){
            req.session.isAuthenticated = true;
            req.session.user = found_user;
            req.session.save((err)=>{
              console.log(req.session);
              res.redirect("/");

            })
          }else{
            console.log(username,password)
            res.render(path.join(rootDir,"views","user","login.ejs"),{
              userInput:{
                email:username,
                password:password
              },
              validationErrors:[]

            });
          }
        }).catch((err)=>{
          var error = new Error();
          error.msg = err;
          error.statusCode = 500;
          next(err);
        });
      }else{
        res.render(path.join(rootDir,"views","user","login.ejs"),{
          userInput:{
            email:username,
            password:password
          },
          validationErrors:[]
        });
      }
    });
  }else{
    console.log(username,password)
    res.status(202).render(path.join(rootDir,"views","user","login.ejs"),
    {
      userInput:{
        email:username,
        password:password
      },
      validationErrors:errors.array()

    }
    );
  }
}

const Logout = (req,res) => {
  req.session.destroy((err)=>{
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  })
}


const GetResetPage = (req,res) =>{
  res.render(path.join(rootDir,"views","user","reset.ejs"));
}


const PostNewPassword = (req,res,next)=>{
  const new_password = req.body.password;
  const userId = req.body.userId;
  let resetUser;
  User.findOne({_id:userId}).then((user)=>{
    resetUser = user;
    bcrypt.hash(new_password,12).then((hash)=>{
      resetUser.password = hash;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = null;
      resetUser.save();
    }).then(result =>{
      res.redirect('/login')
    }).catch(err =>{
      var error = new Error();
      error.msg = err;
      error.statusCode = 500;
      next(err);
    });
  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;
    next(err);
  });

}

const GetNewPassword = (req,res,next)=>{
  const token = req.params.token;
  User.findOne({resetToken:token,resetTokenExpiration:{$gt:Date.now()}}).then((user)=>{
    if(user._id){
      res.render(path.join(rootDir,"views","user","new_password.ejs"),{
        userId:user._id.toString()
      });
    }else{
      res.redirect("/login");
    }
  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;    next(err);
  });
}

const PostResetEmail = (req,res,next) =>{

  var email = req.body.username;
  var errors = validationResult(req);
  if(errors.isEmpty()){
    crypto.randomBytes(32,(err,buffer)=>{
    if(err){
      
      res.redirect("/reset");

    }

  const token = buffer.toString("hex");
  User.findOne({email:email}).then((user)=>{
    if(!user){
      console.log("No User found");
      res.redirect("/reset");
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 360000000;
     user.save();
     return user;
  }).then((user)=>{

    transporter.sendMail({
     to:email,
     from:"info@allstarcommercestore.com",
     subject:"Reset Password",
     html:`Hello ${user.name}, We wanted to let you know that your All-Star ECommerce password was reset.

      If you did not perform this action, you can recover access by entering ${email} into the form at http://localhost:3003/reset_password/${token}

      If you run into problems, please contact support by visiting https://allstarcommercestore.com/contact

      Please do not reply to this email with your password. We will never ask for your password, and we strongly discourage you from sharing it with anyone.`

   }).then((feedback)=>{

     res.redirect("/login")

   }).catch((err)=>{
     var error = new Error();
     error.msg = err;
     error.statusCode = 500;
     next(err);
   });
  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;
    next(err);
  });
});
  }else{
    res.status(202).redirect("/reset");
  }
}

const CreateAccount = (req,res) => {

  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;
  var errors = validationResult(req);
  console.log(errors.array());

  if(errors.isEmpty()){
    User.findOne({email:username}).then((response)=>{
    if(!response){
    bcrypt.hash(password,12).then((encrypt)=>{
        const new_user = new User({
          email: username,
          name:name,
          password:encrypt,
          cart:{items:[]}
        });

        new_user.save();
        req.user = new_user;
    }).then(result =>{
      console.log(result);
       return transporter.sendMail({
        to:username,
        from:"info@allstarcommercestore.com",
        subject:"Created Account",
        html:"You have signed up!"

      }).then(()=>{
        res.redirect("/login");
      }).catch(err=>{console.log(err)});
    })

    }else{
      res.redirect("/create_account");
    }

  });
  }else{
    res.status(202).render(path.join(rootDir,"views","user","create_account.ejs"),{
      userInput:{
        email:username,
        password:password,
        name:name
      },
      validationErrors:errors.array()
    });
  }
}

const GetCreateAccountPage = (req,res) => {
  res.render(path.join(rootDir,"views","user","create_account.ejs"),{
    userInput:{
      email:"",
      password:"",
      name:""
    },
    validationErrors:[]
  });
}



module.exports.GetUserLoginPage = GetUserLoginPage;
module.exports.PostUserLogin = PostUserLogin;
module.exports.Logout = Logout;
module.exports.GetNewPassword = GetNewPassword;
module.exports.GetResetPage = GetResetPage;
module.exports.PostNewPassword = PostNewPassword;
module.exports.PostResetEmail = PostResetEmail;
module.exports.PostUserLogin = PostUserLogin;
module.exports.GetResetPage = GetResetPage;
module.exports.CreateAccount = CreateAccount;
module.exports.GetCreateAccountPage = GetCreateAccountPage;
