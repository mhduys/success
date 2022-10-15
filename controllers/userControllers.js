var userHelpers = require('../helpers/user_helpers')
var productHelper = require('../helpers/product_helpers')
module.exports = {
    userIdex: async function (req, res, next) {
        try {

            productHelper.getProductToHome().then(async (response) => {
                let productToHome = response
                if (req.session.user) {
                    let user = req.session.user
                    
                    let cartCount = await userHelpers.getCartCount(req.session.user._id)
                    //let color=await userHelpers.removeProductFromWishlist()
                    let products = await userHelpers.getWishlistProducts(user._id)
                    //console.log("proooooo:", products);
                    res.render('user/index', { user, cartCount, productToHome, products });
                    // console.log(products);
                } else {
                    res.render('user/index', { productToHome })
                }
            })
        } catch (error) {
            next(error)
        }



    },
    getAllProducts:async(req,res)=>{
        try {
            let page=req.query.page
            let perPage=2
            let skipNo=(page -1)*perPage
            let totalDocuments=await userHelpers.countDocuments()
            let pages= Math.ceil(totalDocuments/perPage)

            let arr=[]
            for (let i=1;i<=pages;i++){
                arr.push(i)
            }
            userHelpers.productViewPagination(perPage,skipNo).then((products)=>{
                res.redirect('/shop')
            })
        } catch (error) {
            next(error)
            
        }

    },
    getUserProfile: async (req, res, next) => {
        try {

            // console.log(req.params.id);

            if (req.session.user) {
                let userId = req.session.user._id

                let cartCount = await userHelpers.getCartCount(userId)
                userHelpers.getUserProfile(userId).then((userData) => {
                    console.log(userData, "uuuuuuuuuuuuuuuuu");
                    //let useData=userData.Address
                    let user = req.session.user

                    res.render('user/user_profile', { user, userData, cartCount })

                })
            }
        } catch (error) {
            next(error)

        }

    },
    postAddAddress: (req, res, next) => {
        try {

            let userId = req.session.user._id
            userHelpers.updateUserProfile(req.body, userId).then((response) => {
                res.redirect('/address')
            })
        } catch (error) {
            next(error)
        }
    },
    postDeleveryAddress: (req, res, next) => {
        try {

            let userId = req.session.user._id
            userHelpers.updateUserProfile(req.body, userId).then((response) => {
                res.redirect('/placeOrder')
            })
        } catch (error) {
            next(error)
        }
    },
    getAddress: async (req, res, next) => {
        try {
            if(req.session.user){
                let userId = req.session.user._id
            let cartCount = await userHelpers.getCartCount(userId)
            userHelpers.getUserProfile(userId).then((userData) => {
                //console.log(userData.Address.length,"uuuuuuuuuuuuuuuuu");
                let userAddressId = userData.AddresId
                if (userAddressId) {
                    for (let i = 0; i < userData.Address.length; i++) {
                        //console.log(userAddressId,"ussseeerr",userData.Address[i].AddressId);
                        if (userAddressId == userData.Address[i].AddressId) {
                            // console.log(userData.Address[i],"loop") 
                            userData.Address[i].value = true
                        }
                    }

                }

                // console.log(curruntAddress,"currrrrrr");
                let user = req.session.user
                res.render('user/address', { user, userData, cartCount })


            })

            }else{
                res.redirect('/login')
            }

            
        } catch (error) { 
            next(error)
        }
    },
    getChangeCurruntAddress: (req, res, next) => {
        try {

            let addresId = req.params.id
            let userId = req.session.user._id
            console.log("addressId:", addresId, "uaerId:", userId);

            userHelpers.changeCurruntAddress(addresId, userId).then((response) => {
                res.redirect('/address')
            })
        } catch (error) {
            next(error)
        }
    },
    getDeleteAddress: (req, res, next) => {
        try {

            let addresId = req.params.id
            let userId = req.session.user._id
            console.log(addresId, "delete", userId);
            userHelpers.deleteUserAddress(addresId, userId).then((response) => {
                res.redirect('/address')
            })
        } catch (error) {
            next(error)
        }
    },
    getEditAddress: (req, res, next) => {
        try {

            let addressId = req.params.id
            let userId = req.session.user._id
            userHelpers.getUserAddress(addressId, userId).then((editAddress) => {
                // editAddress.Address.Pin=parseInt()
                // console.log(curAddress,"nahas");
                res.render('user/edit-userAddress', { editAddress })
            })
        } catch (error) {
            next(error)
        }
    },
    postEditAddress: (req, res, next) => {
        try {
            let addressID = req.params.id
            let userId = req.session.user._id

            userHelpers.editUserAddress(req.body, addressID, userId).then((response) => {
                console.log(req.body, "body Data");
                res.redirect('/address')
            })
        } catch (error) {
            next(error)
        }

    },
    getLogin: (req, res, next) => {
        try {

            let Error = req.session.Error
            let userStatus = req.session.userStatus

            res.render('user/user_login', { Error, userStatus })
            req.session.userStatus = false
            req.session.Error = false

        } catch (error) {
            next(error)
        }
    },
    postLogin: (req, res, next) => {
        try {

            userHelpers.doLogin(req.body).then((response) => {

                if (response.Error) {
                    req.session.Error = true
                    req.session.Error = 'INVALID EMAIL OR PASSWORD'
                    res.redirect('/login')
                } else if (response.userStatus) {

                    req.session.userStatus = true
                    req.session.userStatus = 'Your accound has been blocked. Pleas Try Later'
                    res.redirect('/login')
                }
                else if (response) {
                    console.log(response, "loginResponse");
                    req.session.user = response.user
                    // console.log(req.session.user);
                    req.session.loggedIn = true
                    res.redirect('/')

                }
            })
        } catch (error) {
            next(error)
        }

    },
    getLogout: (req, res, next) => {
        try {

            req.session.destroy()
            res.redirect('/')
            req.session.user = false
        } catch (error) {
            next(error)
        }
    },
    getSignup: (req, res, next) => {
        try {

            let signupError = req.session.signupError
            if (req.session.user) {
                console.log(req.session.user,'sinnnnggg');
                res.redirect('/')
            } else {

                res.render('user/user_signup', { signupError })
                req.session.signupError = false
            }
        } catch (error) {
            next(error)
        }
    },
    postSignup: (req, res, next) => {
        try {

            console.log(req.body, "signup");
            userHelpers.doSignup(req.body).then((response) => {
                if (response.dataError) {
                    req.session.signupError = true
                    req.session.signupError = 'Email Allredy Exists'

                    res.redirect('/signup')
                } else if (response) {

                    req.session.user = response
                    console.log(response, "data");
                    //req.session.loggedIn = true
                    userHelpers.doSMS(response).then((response)=>{
                        if(response.smsError){
                            res.redirect('/signup')
                        }else{

                            res.render('user/otp')
                        }
                    })


                }

            })

        } catch (error) {
            next(error)
        }
    },
    postOTP: (req, res, next) => {
        try {


            console.log(req.body, "post otp");
            userHelpers.otpVerify(req.body, req.session.user).then((response) => {
                if (response.varificeationError) {
                    res.redirect('/signup')
                }else{

                    let userData = req.session.user
                    console.log(userData, "sessionDarta");
                    //req.session.user=response
                   // console.log("lastData");
                    userHelpers.saveToDatabase(userData).then((response) => { 
                        req.session.user=response
                        //console.log(req.session.user,'sesson'); 
                        res.redirect('/')
                    })
                }


                
            })

        } catch (error) {
            next(error)
        }

    },
    getShop:async (req, res, next) => {
        try {
            let page=req.query.page
            
            let perPage=2
            let skipNo=(page -1)*perPage
            let totalDocuments=await userHelpers.countDocuments()
            let pages= Math.ceil(totalDocuments/perPage)
            
            var arr=[]
            for (var i=1;i<=pages;i++){
                arr.push(i)
            }
            
            let user = req.session.user
            productHelper.getAllProducts(perPage,skipNo).then(async (products) => {
                
                let product = products
                
                productHelper.getCategory().then(async (response) => {
                    let category = response
                    if (user) {
                        console.log(product,'this,is products');
                        
                        let cartCount = await userHelpers.getCartCount(req.session.user._id)
                        console.log(cartCount);
                        res.render('user/shop', { product, user, cartCount, category,currentPage:page,totalDocuments,pages,arr})
                    } else {
                        console.log(arr);

                        res.render('user/shop', { product, user, category, product,currentPage:page,totalDocuments,pages,arr})
                    }
                })
            })
        } catch (error) {
            next(error)
        }
    },
    getCategory: (req, res, next) => {
        try {

            let category = req.params.categtory
            productHelper.getCategoryProducts(category).then((product) => {
                let productByCategory = product
                productHelper.getCategory().then(async (response) => {
                    let category = response
                    if(req.session.user){

                        let cartCount = await userHelpers.getCartCount(req.session.user._id)
                        res.render('user/shop', { user: true, productByCategory, cartCount, category })
                    }else{
                        res.render('user/shop', { user: true, productByCategory, category })

                    }
                })

            })

        } catch (error) {
            next(error)
        }
    },
    getCart: async (req, res, next) => {
        try {

            if (req.session.user) {

                let products = await userHelpers.getCartProducts(req.session.user._id,)
                let total = await userHelpers.getTotalAmount(req.session.user._id)
                let singleAmount = await userHelpers.getsingleAmount(req.session.user._id)
                //console.log(products,"single");
                let cartCount = await userHelpers.getCartCount(req.session.user._id)
                let user = req.session.user
                if (products && total && cartCount && user && singleAmount) {

                    res.render('user/cart', { products, total, user, cartCount, singleAmount })
                } else {
                    res.render('user/not-cart')
                }
            } else {
                res.redirect('/login')
            }
        } catch (error) {
            next(error)
        }
    },
    getAdd_to_cart: (req, res, next) => {
        try {

            if (req.session.user) {
                let userId = req.session.user._id

                userHelpers.addToCart(req.params.id, userId).then(() => {
                    console.log("api call");
                    res.json({ status: true })
                })
            } else {
                res.redirect('/login')
            }
        } catch (error) {
            next(error)
        }
    },
    getChangeProductQuantity: (req, res, next) => {
        try {

            userHelpers.changeProductQuantity(req.body).then(async (response) => {
                response.total = await userHelpers.getTotalAmount(req.body.user)
                // response.singleAmount=await userHelpers.getsingleAmount(req.session.user._id)
                console.log(response.total, "total");
                console.log(response.singleAmount, "single");


                res.json(response)

            })
        } catch (error) {
            next(error)
        }


    },
    getRemoveFromCart: (req, res, next) => {
        try {

            let userId = req.session.user._id
            userHelpers.removeFromCart(req.params.id, userId).then((response) => {
                res.json({ delete: true })
            })
        } catch (error) {
            next(error)
        }
    },
    getPlaceOrder: async (req, res, next) => {
        try {

            if (req.session.user) {
                let user = req.session.user
                let total = await userHelpers.getTotalAmount(req.session.user._id)

                // let coupon=await userHelpers.getUserDescount(req.session.user._id)
                //console.log(coupon,"its my coupon");

                let cartCount = await userHelpers.getCartCount(req.session.user._id)
                let products = await userHelpers.getCartProducts(req.session.user._id,)
                let singleAmount = await userHelpers.getsingleAmount(req.session.user._id)
                let coupon=await userHelpers.getAllCoupon()

                //console.log(products,"for");
                userHelpers.getUserProfile(user._id).then((userData) => {
                    let userAddressId = userData.AddresId
                    if (userAddressId) {
                        for (let i = 0; i < userData.Address.length; i++) {
                            //console.log(userAddressId,"ussseeerr",userData.Address[i].AddressId);
                            if (userAddressId == userData.Address[i].AddressId) {
                                // console.log(userData.Address[i],"loop") 
                                userData.Address[i].value = true
                            }
                        }

                    }
                    userHelpers.getUserAddress(userAddressId, user._id).then((userAddress) => {

                        //console.log(userAddress,"userAddress");

                        let couponError = req.session.couponError


                        res.render('user/place-order', { singleAmount, userAddress, total, cartCount, user, userData, products, couponError,coupon })
                        req.session.couponError = false 

                    })


                })

            }else{
                res.redirect('/login')
            }
        } catch (error) {
            next(error)
        }
    },
    postPlaceOreder: async (req, res, next) => {
        try {
           // let userId=req.session.user._id
            console.log(req.body, "placeOrder");
            
            
            let products = await userHelpers.getCartProductList(req.body.userId)
            // let total = await userHelpers.getTotalAmount(req.session.user._id)

            userHelpers.placeOrder(req.body, products).then((orderId) => {
                let total = req.body.lastPrice
                console.log(total, "toooooo");
 

                if (req.body['payment'] == 'COD') {

                    res.json({ codSucces: true })
                } else {
                    userHelpers.generateRazorpay(orderId, total).then((response) => {
                        res.json(response)

                    })
                }

            })

            console.log(req.body, "ppp");
        } catch (error) {
            next(error)
        }
    },
    postVerifyPayment: (req, res, next) => {
        try {

            console.log(req.body, "bodyDatas");
            userHelpers.verifyPayment(req.body).then((response) => {
                userHelpers.changePaymentStatus(req.body['order[receipt]']).then((response) => {
                    console.log("payment succcess");
                    res.json({ status: true })

                })

            }).catch((err) => {

                res.json({ status: false })
            })
        } catch (error) {
            next(error)
        }
    },
    getPlaceOrderAddress: (req, res, next) => {
        try {

            let addressId = req.params.id
            userHelpers.changeCurruntAddress(addressId, req.session.user._id).then((response) => {

                // console.log(address,"placeOrder");
                res.redirect('/placeOrder')
            })
        } catch (error) {
            next(error)
        }

    },
    getOrdereSuccess: (req, res, next) => {
        try {

            res.render('user/order-success', { user: req.session.user })
        } catch (error) {
            next(error)
        }
    },
    getOrders: async (req, res, next) => {
        try {

            // let orders = await userHelpers.getUserOrders(req.session.user._id)

            let products = await userHelpers.getOrderProducts(req.session.user._id)
            //console.log(products,"kkkkkkk");
            // products.orderProducts=orders
            //console.log(products, "ooooooooooooo");
            let cartCount = await userHelpers.getCartCount(req.session.user._id)

            res.render('user/orders', { user: req.session.user, products,cartCount })
        } catch (error) { 
            next(error)
        }
    },
    postDeleveryAddress: (req, res, next) => {
        try {

            let userId = req.params.id
            userHelpers.saveDeleveryAddress(userId)
        } catch (error) {
            next(error)
        }
    },
    getAbout: (req, res, next) => {
        try {

            res.render('user/about')
        } catch (error) {
            next(error)
        }
    },
    getWishlist: async (req, res, next) => {
        try {

            if (req.session.user) {


                // let products=await userHelpers.getWishlistProducts(req.session.user._id,)
                let products = await userHelpers.getWishlistProducts(req.session.user._id,)

                let total = await userHelpers.getTotalAmount(req.session.user._id)
                let cartCount = await userHelpers.getCartCount(req.session.user._id)

                let user = req.session.user
                if (products && user) {

                    res.render('user/wishlist', { products, total, user, cartCount })
                } else {
                    res.render('user/not-wishlist')
                }
            } else {
                res.redirect('login')
            }
        } catch (error) {
            next(error)
        }

    },
    getAdd_to_wishlist: (req, res, next) => {
        try {

            // console.log("product ID:",req.params.id);
            if (req.session.user) {
                let userId = req.session.user._id
                userHelpers.addToWishlist(req.params.id, userId).then((response) => {
                    // console.log("wishlist call");
                    res.json(response)
                })
            } else {

                res.json({ notLogin: true })
            }
        } catch (error) {
            next(error)
        }
    },
    getRemoveFromWishlist: (req, res, next) => {
        try {

            let proId = req.params.id
            let userId = req.session.user._id
            console.log("user:", userId, "producjtId:", proId);
            userHelpers.removeProductFromWishlist(proId, userId).then((response) => {
                res.json(response)
            })
        } catch (error) {
            next(error)
        }
    },
    postApplyCoupon: (req, res, next) => {
        try {

            //let coupon=req.params.coupon
            console.log(req.body, "body");
            userHelpers.applayCoupon(req.body, req.session.user._id).then((response) => {
                if (response.Error) {

                    res.json({ Error: true })
                } else if (response.DateError) {
                    res.json({ DateError: true })
                } else {
                    res.json(response)

                }


            })
        } catch (error) {
            next(error)
        }
    },
    getBuySingleProduct: (req, res, next) => {
        try {

            console.log(req.params.id, "singleId");
        } catch (error) {
            next(error)
        }
    },
    getSearch: (req, res, next) => {
        try {
            let key = req.query.searchKey
            console.log(key);
            productHelper.getCategory().then((category) => {

                userHelpers.productSearch(key).then((products) => {
                    res.render('user/products-search-result', { products, category })
                })
            })

        } catch (error) {
            next(error)

        }
    },
    getFilter: (req, res, next) => {
        try {
            res.render('user/filter')


        } catch (error) {
            next(error)
        }
    },
    postFilter: (req, res, next) => {
        try {
            console.log(req.body);
            productHelper.getfilterProduct(req.body).then((notebook) => {
                console.log(notebook);
                res.json(notebook)
            })

        } catch (error) {

        }
    },
    singelPlaceOrder:(req,res,next)=>{
        try {
            let proId=req.params.id
            let userId=req.session.user._id
            userHelpers.singleProductOrder(proId,userId).then((products)=>{
                let total=products[0].product.Price
                console.log(total,'total');
                userHelpers.getUserProfile(userId).then((userData)=>{
                    let userAddressId = userData.AddresId
                    if (userAddressId) {
                        for (let i = 0; i < userData.Address.length; i++) {
                            //console.log(userAddressId,"ussseeerr",userData.Address[i].AddressId);
                            if (userAddressId == userData.Address[i].AddressId) {
                                // console.log(userData.Address[i],"loop") 
                                userData.Address[i].value = true
                            }
                        }

                    }
                    userHelpers.getUserAddress(userAddressId,userId).then((userAddress)=>{
                        let couponError = req.session.couponError
                        console.log(products,"singlePro");
                        res.render('user/place-order',{products,userAddress,userData,total,user:req.session.user,couponError})
                    })

                })
            })
            
        } catch (error) {
            next(error)
        }
    },
    getCancelOrder:(req,res,next)=>{
        try {
            let proId=req.params.id
            userHelpers.orderCancel(proId).then((response)=>{

               //console.log(response[0].status,'proId');
               //let status=response[0].status


            res.json({status:true})

           })
            
        } catch (error) {
            next(error)
        }
    },
    getViewOrderDetails:(req,res,next)=>{
        try {
            
            let orderId=req.params.id
           // console.log(orderId,"orderId");
            let userId=req.session.user._id
            userHelpers.getOrderFullDetals(orderId).then((products)=>{
                userHelpers.getOrderAddress(orderId).then((address)=>{

                    console.log(address,'products');
                    res.render('user/view-order-details',{products,address})
                })
            })
             
        } catch (error) {
            next(error) 
        }
    },
    getViewSingelProduct:(req,res,next)=>{
        try {
            let proId=req.params.id
            userHelpers.getSingleProduct(proId).then(async(product)=>{
                console.log(product,'singlePorduct');
                
                if(req.session.user){
                    let cartCount = await userHelpers.getCartCount(req.session.user._id)
                    res.render('user/single-product',{product,cartCount}) 
                }else{
                    res.render('user/single-product',{product}) 
                    
                }
                
            })
        } catch (error) {
            next(error)
            
        }
    },
    getInvoive:(req,res,next)=>{

        try {
            let orderId=req.params.id
            console.log(orderId);
            userHelpers.getOrderFullDetals(orderId).then((products)=>{
                userHelpers.getOrderAddress(orderId).then((address)=>{

                    console.log(address,products,'invoiceProducts');
                   // res.render('user/view-order-details',{products,address})
                    res.render('user/invoice',{products,address})
                })
            })
            
            // userHelpers.getDataToInvoive( proId).then((proDetails)=>{
            //     console.log(proDetails);

            // })
            
        } catch (error) {
            next(error)
            
        }
    },
    // =============================Chart==================
    // getUploadPic:(req,res,next)=>{
    //     try {
    //         res.render('user/profile-pic',{user:req.session.user})
    //     } catch (error) {
    //         next(error)
            
    //     }
    // },
    // postSaveProfielPic:(req,res,next)=>{
    //     try {
    //         const Images = []
    //         console.log(req.files.length);
    //         for (i = 0; i < req.files.length; i++) {
    //             Images[i] = req.files[i].filename
    //         }
    //         req.body.Image = Images
    //         console.log(req.files,"kkk");
    //         userHelpers.addProfielPic(req.body,req.session.user._id)
    //     } catch (error) {
    //         next(error)
            
    //     }
    // }



}