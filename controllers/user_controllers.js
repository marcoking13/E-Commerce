var path = require("path");
var rootDir = require("./../util/path.js");
const Product = require("./../models/products.js");
const PlaceholderImages = require("./../data/items_placeholder_other_rated.js");
const Reviews = require("./../data/reviews.js");

const Cart = require("../models/cart.js");
const User = require("../models/user.js");
const Order = require("../models/orders.js");

const ObjectId = require("mongodb").ObjectId;
function FindHighestDiscount(products){

  var top_deal = 0;
  var highest_product;

  for(var i =0; i <products.length;i++){

    if(products[i].discount > top_deal){

        top_deal = products[i].discount;
        highest_product = products[i];

      }

    }

  return highest_product;

}

function OrganizeDiscounts(products){

  var new_products = {...products};

  for(var i =0; i <products.length;i++){

    if(products[i].discount > 20){
      new_products.push(products[i]);
    }

  }

  return  new_products;

}

const DeleteCartItem = async (req,res,next) => {

    var id = req.body._id;
    req.user.deleteProduct(id).then((response)=>{
      res.redirect("/cart");
    }).catch((err)=>{
      var error = new Error();
      error.msg = err;
      error.statusCode = 500;
      next(error)
    });

}

const GetAdminPage = (req,res) => {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
  }else{
    res.render(path.join(rootDir,"views","user","user_admin.ejs"),{
      isAuthenticated:req.session.isAuthenticated
    });
  }
}

const GetOrders = async(req,res)=>{
  Order.find({"user.userId":req.user._id}).then((orders)=>{
    res.json(orders);
  })
}

const AddOrder = async(req,res,next) =>{
  req.user.populate("cart.items.prodId").then((user)=>{
    const product_data = [...user.cart.items];

    const user_data = {
      userId: user._id,
      name:user.name
    }
    const new_order = new Order(
      {
        products:product_data,
        user:user_data
      });
     new_order.save();
     req.user.ClearCart();

  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;
    next(error)
  });
}

 const GetProductDetail = async (req,res,next) =>{

   var id = req.params._id
   Product.findById(id).then((product)=>{
     if(!product){
       res.redirect("/")
     }else{

       res.render(path.join(rootDir,"views","user","detail.ejs"),{
         item:product,
         isAuthenticated:req.session.isAuthenticated
       });

     }

   }).catch((err)=>{
     var error = new Error();
     error.msg = err;
     error.statusCode = 500;
     next(error)
   });

 }

const AddToCart = async (req,res,next)=>{

  var id = req.body.id;
  var id_ = id.replace("/","");
  var product = req.body;
  Product.findById(id_).then((data)=>{
    req.user.AddCart(data);
    res.redirect(`/product/${id_}`);
  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;
    next(error)
  });

}

const GetHomePage = async (req,res,next) => {

  Product.find().then(async (all_products) =>{

    var top_deals = [];
    var highest_product = null;

    if(all_products.length > 5){

      highest_product = FindHighestDiscount(all_products);

      top_deals.push(highest_product);

      top_deals = OrganizeDiscounts(top_deals);

    }else{
      top_deals = [...all_products];
    }
    res.render(path.join(rootDir,"views","user","index.ejs"),{
      items:{
        top_deals:top_deals,
        highest_deal: highest_product,
        placeholder:PlaceholderImages,
      },
      reviews:Reviews,
      isAuthenticated:req.session.isAuthenticated
    })

 }).catch((err)=>{
   var error = new Error();
   error.msg = err;
   error.statusCode = 500;
   next(error)
 });

}

const GetProducts = async (req,res,next) =>{
  var products = Product.find().then((data)=>{
    res.json(data);
  }).catch((err)=>{
    var error = new Error();
    error.msg = err;
    error.statusCode = 500;
    next(error)
  });
}

const GetCartPage = async (req,res) =>{
  var user = req.user;
  res.render(path.join(rootDir,"views","user","cart.ejs"),{items:user.cart.items,total_price:20})

}



module.exports.DeleteCartItem = DeleteCartItem;
module.exports.GetCartPage = GetCartPage;
module.exports.GetAdminPage = GetAdminPage;

module.exports.GetOrders = GetOrders;
module.exports.GetHomePage = GetHomePage;
module.exports.GetProducts = GetProducts;
module.exports.AddToCart = AddToCart;
module.exports.AddOrder = AddOrder;
module.exports.GetProductDetail = GetProductDetail;
