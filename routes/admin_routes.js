var router = require("express").Router();
var path = require("path");
var rootDir = require("./../util/path.js");
var adminControllers = require("./../controllers/admin_controllers.js");
var isAuth = require("./../middleware/isAuth.js");

router.get("/admin/add_product",isAuth,adminControllers.GetMainPage);

router.post("/admin/add_product",isAuth,adminControllers.AddProduct);
router.get("/edit/:id",isAuth,adminControllers.FindOneProduct);
router.post("/product/edit",isAuth,adminControllers.EditOneProduct);
router.post("/product/delete",isAuth,adminControllers.DeleteOneProduct);
router.get("/admin/get_products",isAuth,adminControllers.GetProducts);



module.exports = router;
