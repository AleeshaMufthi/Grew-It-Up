const express = require('express')
const userRoute = express()
const userControler = require('../controllers/user/userController')
const addressControler = require('../controllers/user/addressController')
const orderController = require('../controllers/user/orderController')
const cartControler = require('../controllers/user/cartController')
const couponController = require('../controllers/admin/couponController')
const {islogin, islogout, isLoggedUser} = require('../middleware/userAuth')
const multer=require('../middleware/multer')

// REGISTER
userRoute.get('/register',islogout,userControler.loadRegister );
userRoute.post('/register',userControler.insertUser );
userRoute.get('/otp',userControler.loadOtp );
userRoute.post('/otp',userControler.verifyOtp );
userRoute.get('/resendOTP',userControler.resendOTP );
userRoute.get('/logout',islogin,userControler.userLogout );


// HOME
userRoute.get('/',userControler.loadHome );

// USER LOGIN
userRoute.get('/login',isLoggedUser,userControler.loadLogin );
userRoute.post('/login',isLoggedUser,userControler.verifyLogin );
userRoute.get('/forgotPassword',islogout,userControler.loadForgetpassword );
userRoute.post('/forgotpassword',userControler.forgotPasswordOTP );
userRoute.get('/resetPassword',userControler.loadResetPassword );
userRoute.post('/resetPassword',userControler.resetPassword );
userRoute.post('/changePassword',userControler.resetPassword );

// SHOP
userRoute.get('/shop',userControler.loadShop );
userRoute.get('/singleProduct/:id',userControler.loadSingleShop );
userRoute.get('/shopCategoryFilter',userControler.loadShopCategory );

// CONTACT
userRoute.get('/contact',islogin,userControler.loadContactPage);

// ABOUT US
userRoute.get('/aboutUs',islogin,userControler.loadAboutUs)

// USER PROFILE
userRoute.get('/userprofile',userControler.loadprofile);
userRoute.post('/userprofile',multer.uploadUser.single('image'),userControler.userEdit)

// ADDRESS
userRoute.get('/userAddress',addressControler.loadAddress );
userRoute.get('/addAddress',addressControler.loadAddAddress );
userRoute.post('/addAddress',addressControler.addAddress );
userRoute.get('/editAddress',addressControler.loadEditAddress );
userRoute.post('/editAddress',addressControler.editAddress );
userRoute.get('/deleteAddress',addressControler.deleteAddress );

// CART
userRoute.get('/cart',islogin,cartControler.loadCartPage );
userRoute.post('/cart',islogin,cartControler.addToCart);
userRoute.put("/updateCart",islogin,cartControler.updateCartCount);
userRoute.delete("/removeCartItem",islogin,cartControler.removeFromCart);

// CHECKOUT
userRoute.get('/checkout',islogin,orderController.loadCheckout );
userRoute.post('/checkout',islogin,orderController.checkOutPost );
// userRoute.post('/cancelProduct',orderController.cancelProduct)

// ORDER
userRoute.get('/orderSuccess',islogin,orderController.loadOrderDetails );
userRoute.get('/orderDetails/:id',islogin,orderController.loadOrderHistory );
userRoute.post('/orderCancel',islogin,orderController.orderCancel );

// PAYMENT
userRoute.post('/razorpayOrder',islogin,orderController.razorpayOrder );

// COUPON
userRoute.get('/coupons',islogin,couponController.userCouponList)
userRoute.post('/applyCoupon',islogin,orderController.applyCoupon)

// WALLET
userRoute.get('/Wallet',islogin,userControler.loadWallets );

module.exports = userRoute

