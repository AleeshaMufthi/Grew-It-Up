const express = require("express");
const adminRoute = express();
const multer = require('../middleware/multer');
const adminController = require('../controllers/admin/adminController');
const categoryController = require('../controllers/admin/categoryController');
const productController = require('../controllers/admin/productController');
const orderController = require('../controllers/admin/orderController');
const couponController = require('../controllers/admin/couponController');
const offerController = require('../controllers/admin/offerController')
const adminAuth = require('../middleware/adminAuth');


// LOGIN
adminRoute.get("/", adminAuth.isLogout, adminController.loadAdminLogin);
adminRoute.get("/logout", adminController.adminLogout);
adminRoute.post("/", adminController.verifyLogin);

// USER
adminRoute.get("/userData", adminAuth.isLogin, adminController.loadUserpage);
adminRoute.get('/unlistUser', adminAuth.isLogin, adminController.listUser)

// HOME
adminRoute.get("/home", adminAuth.isLogin, adminController.loadHome);

// ADD CATEGORY
adminRoute.get("/category", adminAuth.isLogin, categoryController.loadCategory);
adminRoute.get("/addCategory", adminAuth.isLogin, categoryController.loadCategoryform);
adminRoute.post("/addCategory", multer.uploadCategory.single('image'), categoryController.addCategory);
adminRoute.get("/editCategory", adminAuth.isLogin, categoryController.loadEditCategory);
adminRoute.post("/editCategory", multer.uploadCategory.single('image'), categoryController.CategoryEdit);
adminRoute.get('/unlistCategory', adminAuth.isLogin, categoryController.unlistCategory)

// ADD PRODUCT
adminRoute.get("/products", adminAuth.isLogin, productController.loadProducts);
adminRoute.get("/addproduct", adminAuth.isLogin, productController.loadPorductForm);
adminRoute.post("/addproduct", multer.uploadProduct.array('images'), productController.addProduct);
adminRoute.get("/editProduct", adminAuth.isLogin, productController.loadEditProductForm);
adminRoute.get("/deleteProduct/:id", adminAuth.isLogin, productController.deleteProduct);
adminRoute.post("/editProduct", multer.uploadProduct.array('images'), productController.storeEditProduct);

// ALL ORDERS
adminRoute.get("/alluserorders", adminAuth.isLogin, orderController.listUserOrders);
adminRoute.get("/orderDetails", adminAuth.isLogin, orderController.listOrderDetails);
adminRoute.put("/orderStatusChange", orderController.orderStatusChange);

// SALES REPORT
adminRoute.get("/salesReport", adminAuth.isLogin, orderController.loadSalesReport);

// COUPON
adminRoute.get('/couponAdd',adminAuth.isLogin,couponController.loadCouponAdd);
adminRoute.post("/couponAdd",couponController.addCoupon );
adminRoute.get("/couponList", adminAuth.isLogin,couponController.loadCouponList );
adminRoute.get("/couponEdit", adminAuth.isLogin,couponController.loadEditCoupon );
adminRoute.put("/couponEdit",couponController.editCoupon );
adminRoute.get("/couponUnlist", adminAuth.isLogin, couponController.unlistCoupon);
adminRoute.get("/couponDetails", adminAuth.isLogin, couponController.couponDetails);

// OFFER
adminRoute.get("/offerAdd", adminAuth.isLogin,offerController.loadOfferAdd );
adminRoute.post("/offerAdd",offerController.addOffer );
adminRoute.get("/offerlist", adminAuth.isLogin,offerController.OfferList );
adminRoute.get("/offerEdit", adminAuth.isLogin,offerController.loadOfferEdit );
adminRoute.put("/offerEdit", adminAuth.isLogin,offerController.editOffer );
adminRoute.get("/blockOffer", adminAuth.isLogin,offerController.offerBlock );

module.exports = adminRoute