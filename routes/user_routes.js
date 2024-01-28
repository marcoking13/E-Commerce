var router = require("express").Router();
var userControllers = require("./../controllers/user_controllers.js");
var isAuth = require("./../middleware/isAuth.js");

//
router.get("/",userControllers.GetHomePage);
router.get("/cart",userControllers.GetCartPage);
//
router.get("/get_products",userControllers.GetProducts);
router.get("/product/:_id",userControllers.GetProductDetail);
router.get("/orders/",userControllers.GetOrders);

router.post("/cart",userControllers.AddToCart);
router.post("/cart/delete",userControllers.DeleteCartItem);
router.get("/cart/purchase",userControllers.AddOrder);
router.get("/user/",userControllers.GetAdminPage);
//
module.exports = router;
