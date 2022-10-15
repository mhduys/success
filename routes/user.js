var express = require('express');
const { response } = require('../app');
var router = express.Router(); 
var multer=require('multer')

var userController = require('../controllers/userControllers')

/* GET home page. */
// router.get('/index',(req,res)=>{
//   res.render('user/index')
// })
function verifyLogin(req,res,next){
  if(req.session.admin){ 
    next()
  }else{
    res.redirect('/user/login')
  }
}
// multer
// const fileStorageEngine = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/admin/product-Images')
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '--' + file.originalname)
//   }
// })

// const upload = multer({ storage: fileStorageEngine })


// ======================HOME===============================
router.get('/',userController.userIdex)


//============PROFILE=====================

router.get('/userProfile',userController.getUserProfile) 
//router.get('/profilePic',userController.getUploadPic)
//router.post('/saveProfielPic',upload.array('Image',3),userController.postSaveProfielPic)

router.post('/add-address',userController.postAddAddress)
router.post('/add-deleveryAddress',userController.postDeleveryAddress)

 router.get('/address',userController.getAddress)
 router.get('/changeCurruntAddress/:id',userController.getChangeCurruntAddress)
router.get('/deleteAddress/:id',userController.getDeleteAddress)
router.get('/editAddress/:id',userController.getEditAddress)
router.post('/edit-address/:id',userController.postEditAddress)

router.get('/login',userController.getLogin)
router.post('/login',userController.postLogin)

router.get('/logout',userController.getLogout)

router.get('/signup',userController.getSignup)
router.post('/signup',userController.postSignup)
//======================= SHOP AND CATEGORY=================
router.get('/shop',userController.getShop)

router.get('/product/:categtory',userController.getCategory)

// ==================CART==============================

router.get('/cart',userController.getCart)

router.get('/add-to-cart/:id',userController.getAdd_to_cart)
router.post('/change-product-quantity',userController.getChangeProductQuantity)

router.get('/removeFromCart/:id',userController.getRemoveFromCart)
router.post('/otp',userController.postOTP)

//============================place order======================
router.get('/placeOrder',userController.getPlaceOrder)

router.post('/place-order',userController.postPlaceOreder)

router.post('/verify-payment',userController.postVerifyPayment)
router.get('/placeOrderAddress/:id',userController.getPlaceOrderAddress)
router.get('/order-success',userController.getOrdereSuccess)
router.get('/orders',userController.getOrders)
router.post('/deleveryAddress/:id',userController.postDeleveryAddress)
//========================== ABOUT US ===========================
router.get('/about',userController.getAbout)
//======================= WISH LIST=====================================
router.get('/wishlist',userController.getWishlist)
router.get('/add-to-wishlist/:id',userController.getAdd_to_wishlist)
router.get('/remove-from-wishlist/:id',userController.getRemoveFromWishlist)
//=========================COUPON========================
router.post('/applayCoupon',userController.postApplyCoupon)

//===========================BUY==================
router.get('/buy-single-product/:id',userController.getBuySingleProduct)
//===========================BUY==================
// =================search======================
router.get('/search',userController.getSearch)
router.get('/filter',userController.getFilter)
router.post('/productFilter',userController.postFilter)  
router.post('/otp',userController.postOTP)





// ==================single Product=====================
router.get('/singelPlaceOrder/:id',userController.singelPlaceOrder)
router.get('/cancelOrder/:id',userController.getCancelOrder)
router.get('/viewOrderDetails/:id',userController.getViewOrderDetails)
router.get('/viewSingleProduct/:id',userController.getViewSingelProduct)
router.get('/invoice/:id',userController.getInvoive)
router.get('/getAllProducts',userController.getAllProducts)



module.exports = router; 
