var path = require("path");
var rootDir = require("./../util/path.js");
var ObjectId = require("mongodb").ObjectId;

const Product = require("./../models/products.js");

var ObjectID = require("mongodb").ObjectID;

const GetMainPage = (req,res,next) => {

     Product.find({userId:req.user._id}).then((products)=>{
      res.render(path.join(rootDir,"views","admin.ejs"),{products:products});
    }).catch((err)=>{
      var error = new Error();
      error.msg = err;
      error.statusCode = 500;
        next(err);
    });

}

const DeleteOneProduct = (req,res,next) =>{
  var id = req.body.id;

  Product.deleteOne({_id:new ObjectId(id)}).then((response)=>{
    if(response){
      console.log("Deleted Successfully");
    }else{
      console.log("Could not Delete");
    }

    res.redirect("/admin/add_product");

  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;
    next(err);
  });

}


const GetProducts = async (req,res,next) =>{

  var products = Product.find({}).then((data)=>{
    res.redirect("/admin/add_product")
  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;
    next(err);
  });

}

const FindOneProduct = async (req,res,next) =>{

  var _id = req.params.id;

  var products = Product.findById(_id).then((data)=>{
      var new_product = data;
      return res.json(new_product);
    }).catch((err)=>{
      var error = new Error();
      error.msg = err;
      error.statusCode = 500;
      next(err);
    });


}

const EditOneProduct = async (req,res,next) =>{

  var body = req.body;

  Product.findById(body._id).then((product)=>{
    product.title = body.title;
    product.thumbnail = body.thumbnail;
    product.description = body.description;
    product.price = body.price;
    product.banner = body.banner;
    product.catagory = body.catagory;
    product.quantity = body.quantity;
    product.userId = 0 ;
    product.discount = body.discount;
    var products = new Product(product);
    products.save().then((data)=>{;
      res.redirect("/admin/add_product");
    })
  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;
    next(err);
  });

}

const AddProduct = async (req,res,next) =>{

    var body  = req.body;

    var schema = {
      title:body.title,
      quantity:body.quantity,
      description:body.description,
      price:body.price,
      discount:body.discount,
      catagory:body.catagory,
      banner:body.banner,
      thumbnail:body.thumbnail,
      userId:req.user
    }

    var products = new Product(schema);

    products.save().then((data)=>{

      res.redirect("/admin/add_product")
    }).catch((err)=>{
      var error = new Error();
      error.msg = err;
      error.statusCode = 500;
      next(err);
    });

  }

module.exports.DeleteOneProduct = DeleteOneProduct;
module.exports.GetMainPage = GetMainPage;
module.exports.GetProducts = GetProducts;
module.exports.FindOneProduct = FindOneProduct;
module.exports.EditOneProduct = EditOneProduct;
module.exports.AddProduct = AddProduct;
