var path = require("path");
var rootDir = require("./../util/path.js");
const Product = require("./../models/products.js");
const PlaceholderImages = require("./../data/items_placeholder_other_rated.js");
const Reviews = require("./../data/reviews.js");
const pdf = require('pdfkit');
const fileHelper = require("./../util/file.js");
const Cart = require("../models/cart.js");
const User = require("../models/user.js");
const Order = require("../models/orders.js");
const stripe = require("stripe")("sk_test_51OjAfEL9aEOLpUqjCLjitVLvOalLj9CCZEpk9SPkxZnmh2xJZSsB8Fp8mrkAO8lNUaogi51OVptQ9Tc56el67Skg008Rlc9dP2");

const ObjectId = require("mongodb").ObjectId;

var default_catagories = [
    {
      catagory:"Sportswear",
      items:[]
    },
    {
      catagory:"Fashion",
      items:[]
    },
    {
      catagory:"Electronics",
      items:[]
    },
    {
      catagory:"Home",
      items:[]
    },
    {
      catagory:"Cookware",
      items:[]
    },
]

async function FindHighestDiscount(products){

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

async function GetItemsInCatagory(catagory){
  Product.find({catagory:catagory}).then((products)=>{
    for(var i =0; i < default_catagories.length; i ++){
      if(catagory == default_catagories[i].catagory){
        default_catagories[i].items = products;
        break;
      }
    }
  })
}


function OrganizeDiscounts(products){

  var new_products = {...products};
  console.log(new_products)
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
   console.log(req.user.populate);
    var user = req.user;
  req.user.execPopulate("cart.items.prodId").then((user)=>{
    const product_data = [...user.cart.items];
    console.log(user.cart.items);
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
     res.redirect("/");
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
         cart:req.user.cart,
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
    for(var i =0; i < default_catagories.length; i++){
      const result = all_products.filter((product) => product.catagory ==  default_catagories[i].catagory);
      default_catagories[i].items = result
    }
    console.log(default_catagories);
    // if(all_products.length > 5){
    //
    //   highest_product = FindHighestDiscount(all_products);
    //
    //   top_deals.push(highest_product);
    //
    //   top_deals = OrganizeDiscounts(top_deals);
    //
    // }else{
    top_deals = [...all_products];

    res.render(path.join(rootDir,"views","user","index.ejs"),{
      items:{
        top_deals:top_deals,
        highest_deal: highest_product,
        placeholder:PlaceholderImages,
      },
      catagories:default_catagories,
      cart:req.user.cart,
      reviews:Reviews,
      isAuthenticated:req.session.isAuthenticated
    })

 }).catch((err)=>{
   console.log(err);
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

const DeleteCart= (req,res)=>{
  req.user.ClearCart();
}

const GetCartPage = async (req,res) =>{
  var user = req.user;
//  console.log(user.cart.items);
  var total_price = 0;
  if(req.user.cart.items.length > 0){
    for(var i =0; i <req.user.cart.items.length; i ++ ){
      var item = req.user.cart.items[i];
      total_price += item.data.price  * item.quantity;
    }
    console.log(total_price);
  }

  res.render(path.join(rootDir,"views","user","cart.ejs"),{items:user.cart.items,cart:req.user.cart,total_price:total_price,isAuthenticated:req.session.isAuthenticated})

}

const GetCheckoutPage = async (req,res) =>{
  var user = req.user;
  var item;

//  console.log(user.cart.items);

  var total_price = 0;
  if(req.user.cart.items.length > 0){
    for(var i =0; i <req.user.cart.items.length; i ++ ){
      item = req.user.cart.items[i];
      total_price += item.data.price  * item.quantity;
    }
    console.log(total_price);
  }

   stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: req.user.cart.items.map((p)=>{
        return {
          quantity: p.quantity,
          price_data:{
            unit_amount:p.data.price * 100,
            product_data:{
              name: p.data.title,
              description:p.data.description
            },
            cart:req.user.cart,
            currency:"usd",
        }
      }

    }),
    mode:"payment",
    success_url:req.protocol + "://" + req.get("host") + "/checkout/success",
    cancel_url:req.protocol + "://" + req.get("host") + "/checkout/cancel",
  }).then((session)=>{
    res.render(path.join(rootDir,"views","user","checkout.ejs"),{
      items:user.cart.items,
      total_price:total_price,
      sessionId: session.id,
      isAuthenticated:req.session.isAuthenticated
    })
  });

}

module.exports.DeleteCartItem = DeleteCartItem;
module.exports.GetCartPage = GetCartPage;
module.exports.GetAdminPage = GetAdminPage;
module.exports.GetCheckoutPage = GetCheckoutPage;
module.exports.GetOrders = GetOrders;
module.exports.DeleteCart = DeleteCart;

module.exports.GetHomePage = GetHomePage;
module.exports.GetProducts = GetProducts;
module.exports.AddToCart = AddToCart;
module.exports.AddOrder = AddOrder;
module.exports.GetProductDetail = GetProductDetail;
