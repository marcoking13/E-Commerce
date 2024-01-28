var express = require("express");
var ejs = require("ejs");
var app = express();
var bodyParser = require("body-parser");
const csrf = require('csrf');
const bcrypt = require("bcrypt")
var path = require("path");
var port = 3003 ;
var user_routes = require("./routes/user_routes.js");
var admin_routes = require("./routes/admin_routes.js");
var auth_routes = require("./routes/auth_routes.js");
var session = require("express-session");
var mongoose = require("mongoose");
var rootDir = require("./util/path.js");
var multer = require("multer");
var MongoDBStore = require("connect-mongodb-session")(session);
var StoreSession =  new MongoDBStore({
  uri:"mongodb+srv://mawile12:sableye12@cluster0.mv38jgm.mongodb.net/shop?",
  collection:"session"
});
// var db = require("./util/db.js");
var User = require("./models/user.js");
app.set("views","views")
app.set("view engine","ejs");

const fileStorage = multer.diskStorage({
  destination: (req,file,cb) =>{
    cb(null,file.originalname)
  },
  filename: (req,file,cb) =>{
    cb(null,file.originalname);
  }
})

// app.use(cookieParser());
// app.use(csrf);
app.use(session({secret:"43489438994388948949842894389",saveUninitialized:false,store:StoreSession}));
app.use(multer({fileStorage}).single("image"));
app.use((req,res,next)=>{

  if(req.session.user){
    User.findById(req.session.user._id).then((user)=>{
      req.user = user;
      next();
    });
  }else{
    next();
  }
});

app.use(bodyParser.urlencoded({extended:false}));



app.use(express.static(path.join(__dirname,"public")));

app.use(user_routes);
app.use(admin_routes);
app.use(auth_routes);

app.get("/error",((req,res)=>{
  res.render(
    path.join(rootDir,"views","error.ejs")
  )
}));



app.use((error,req,res,next)=>{
  console.log(error);
  res.status(error.statusCode).render(path.join(rootDir,"views","error.ejs"),{
    errMessage:error,
    error:error,
    statusCode:error.statusCode
  })
});

app.use((req,res)=>{
  console.log("S");
  res.render(
    path.join(rootDir,"views","404.ejs")
  )
});


mongoose.connect("mongodb+srv://mawile12:sableye12@cluster0.mv38jgm.mongodb.net/shop?retryWrites=true&w=majority").then((s)=>{

  User.find().then((users)=>{

    if(users.length <= 0){

      var schema_ = {
        name:"Marco Khodr",
        email:"marcokhodr16@gmail.com",
        cart:{
          items:{
              prodId:"",
              quantity:1
          }
        }
      }

      var new_user = new User(schema_);

      new_user.save();

    }

  }).then(()=>{

    app.listen(port,()=>{
      console.log("Running on localhost:"+port)
    })
  });
}).catch(err => console.log(err));
