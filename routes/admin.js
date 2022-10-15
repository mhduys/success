var express = require('express');

var router = express.Router();

var multer=require('multer')
var fs=require('fs')
var path=require('path')
var adminController = require('../controllers/adminControllers')

//veryfy login
function verifyLogin(req,res,next){
  if(req.session.admin){  
    next()
  }else{
    res.redirect('/admin/admin_login')
  }
}
// multer using
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/admin/product-Images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname)
  }
})

const upload = multer({ storage: fileStorageEngine })

/* GET users listing. */
router.get('/',adminController.getIndex)
// =============login
router.get('/admin_login',adminController.login)

router.post('/admin_login',adminController.postLogin)
router.get('/add_product',verifyLogin,adminController.getAddProduct)
router.post('/add_product',upload.array('Image',3),adminController.postAddProduct)
//===================================CATEGORY PRODUCTS================================================
router.get('/products/:category',adminController.getCategory)




//===============================================================================

router.get('/deleteProduct/:id/',adminController.getDeleteProduct)
router.get('/logout',adminController.getLogout)

// ==================  EIDT PRODUCT====================

router.get('/editProduct/:id',verifyLogin,adminController.getEditProduct)

router.post('/editProduct/:id',upload.array('Image',3),adminController.postEditProduct)



router.get('/addCategory',verifyLogin,adminController.getAddCategory)

router.post('/addCategory',adminController.postAddCategory)


// =======================allProducts==========================================
router.get('/allProducts',verifyLogin,adminController.getAllProduts)


// =======================all users==========================================
router.get('/allUsers',verifyLogin,adminController.getAllUsers)

//  ===================User Management===================
router.get('/deleteUser/:id',adminController.getDeleteUser)
router.get('/block/:id',adminController.getBlock)
router.get('/unBlock/:id',adminController.getUnblock)
// =================================Coupon============================
router.get('/coupon',verifyLogin,adminController.getCoupon)
router.post('/addCoupon',adminController.postAddCoupon)


// =================================Coupon============================
// ====================================ORDERS===========================
router.get('/orders',verifyLogin,adminController.getOrders)
router.get('/viewOrederDetails/:id',verifyLogin,adminController.getViewOrderDetails)
router.post('/placed',adminController.postPlaced)
router.post('/shipped',adminController.postShipped)
router.post('/deleverd',adminController.postDeleverd)
// ====================================ORDERS===========================
// =================================seach=============================
router.get('/search',verifyLogin,adminController.getSearch)
//====================================Dashboard=========================
router.get('/totalRevenue',adminController.getTotalRevenue)
router.get('/revenue',adminController.getRevenue)
router.get('/searchOrders',adminController.getSearchOrders)
router.get('/searchProducts',adminController.getSearchProducts)
router.get('/salesInvoice',adminController.getSalesInvoice)
router.get('/allSlaesReport',adminController.getAllSalesReport)

//=========================ADMIN ERROR PAGE CONTROLLER=======================
router.use(function(req,res,next){
  next(createError(404))
});
router.use(function(err,req,res,next){
  console.log("admi Error rout Handler");
  res.status(err.status || 500);
  res.render('admin/admin-error',{admin:true})

})
module.exports = router;
