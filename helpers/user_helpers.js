var db = require('../config/connection')
var collections = require('../config/collections')
var bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
const { response, use } = require('../app')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id:process.env.KEYID,
    key_secret:process.env.KEYSECRET,
});
//const client=require('twilio')

const client = require('twilio')(process.env.ACOUNTID,process.env.TOKEN);
const serviceId =process.env.SERVICEID
module.exports = {
    doSignup: (userData) => {
        userData.Mobile=parseInt(userData.Mobile)
        return new Promise(async (resolve, reject) => {
            try {

                userData.User = true
                let response = {}
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: userData.Email })

                if (user) {
                    //response.status = false
                    resolve({ dataError: true })
                } else {
                    //response.status = true
                   

                    //await db.get().collection(collections.USER_COLLECTION).insertOne(userData)
                    //let user = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: userData.Email })
                    //console.log(user, "daaaaa");
                    resolve(userData)

                }
            } catch (error) {
                reject(error)

            }

        })

    },
    countDocuments:()=>{
        return new Promise(async(resolve,reject)=>{  
            try {  
                let countDocuments=db.get().collection(collections.PRODUCT_COLLECTION).countDocuments()
                resolve(countDocuments)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    productViewPagination:(perPage,skipNo)=>{
        return new Promise(async(resolve,reject)=>{
            let product=db.get().collection(collections.PRODUCT_COLLECTION).find().limit(perPage).skip(skipNo).toArray()
            resolve(product)
        })
    },
    doSMS:(userData)=>{
        return new Promise(async (resolve, reject) => {
            let res = {}
           // console.log(userData);
            //console.log('eeeeeeeeeeeeeeee');
            await client.verify.services(serviceId).verifications.create({

                to: `+91${userData.Mobile}`,
                channel: "sms"
            }).then((reeee) => {
                res.valid = true;
                resolve(res)
                console.log(reeee,"reee");
            }).catch((err) => {

                console.log(err);

            })
        })
    },
    otpVerify: (otpData, userData) => {
        console.log(otpData);
        console.log(userData);


        return new Promise(async (resolve, reject) => {
            await client.verify.services(serviceId).verificationChecks.create({
                to: `+91${userData.Mobile}`,
                code: otpData.otp
            }).then((verifications) => {
                if(verifications){

                    console.log(verifications,"varification");
                    resolve(verifications.valid)
                }else{
                    resolve({varificeationError:true})
                }
            })
        })
    },
    saveToDatabase:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                 userData.Password = await bcrypt.hash(userData.Password, 10)
                await db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((response)=>{
                    //console.log(userData,"fromdatabace");

                    resolve(userData)
                })
                
            } catch (error) {
                reject(error)
                
            }
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {

                let loginStatus = false
                let response = {}
                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: userData.Email })
                if (user) {
                    if (user.User) {
                        bcrypt.compare(userData.Password, user.Password).then((status) => {
                            if (status) {
                                response.user = user

                                resolve(response)

                            } else {

                                resolve({ Error: true })
                            }
                        })
                    } else {

                        resolve({ userStatus: true })
                    }

                }
                else {
                    response.status = false
                    resolve({ Error: true })
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let users = await db.get().collection(collections.USER_COLLECTION).find().toArray()
                resolve(users)
            } catch (error) {
                reject(error)
            }
        })
    },
    updateUserProfile: (userData, userId) => {

        userData.AddressId = Date.now()
        // userData.Address[0].Pin=parseInt()
        let addressId = userData.AddressId

        console.log(addressId, "addressId");
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION)
                    .findOne({ _id: objectId(userId) }, { Address: { $in: ["AddressId"] } }).then((response) => {
                        console.log(response, "adddrrreeesss");
                        if (response) {
                            db.get().collection(collections.USER_COLLECTION)
                                .updateOne({ _id: objectId(userId) },

                                    {

                                        $push: { Address: userData },
                                        $set: { AddresId: addressId }

                                    }
                                ).then((response) => {
                                    resolve({ addAddress: true })
                                })

                        }
                    })
            } catch (error) {
                reject(error)
            }

        })
    },
    getUserProfile: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                    // console.log(response,"address");


                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }

        })

    },
    getLatestUserAddress: (userAddressId, userId) => {

        return new Promise(async (resolve, reject) => {
            try {

                let curruntAddress = await db.get().collection(collections.USER_COLLECTION).aggregate([
                    {
                        $match: { AddresId: userAddressId }
                    }
                ]).toArray()
                let length = curruntAddress[0].Address.length
                let curAddress = curruntAddress[0].Address[length - 1]
                resolve(curAddress)
            } catch (error) {
                reject(error)
            }
        })
    },
    changeCurruntAddress: (addressId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION)
                    .updateOne({ _id: objectId(userId) }, {
                        $set: { AddresId: addressId }
                    }).then((response) => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    },

    deleteUserAddress: (addressId, userId) => {
        let AddressID = parseInt(addressId)
        // console.log(addressId,"addresIddd",userId);
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION)
                    .updateOne({ _id: objectId(userId) }, {
                        $pull: { Address: { AddressId: AddressID } }
                    }).then((response) => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    getUserAddress: (addressId, userId) => {
        let AddressID = parseInt(addressId)
        return new Promise(async (resolve, reject) => {
            try {

                let curruntAddress = await db.get().collection(collections.USER_COLLECTION)
                    .aggregate([

                        {
                            $match: {
                                _id: objectId(userId)
                            }
                        },
                        {
                            $unwind: "$Address"

                        },

                        {
                            $match: { "Address.AddressId": AddressID }
                        },
                        {
                            $project: { Address: 1, _id: 0 }
                        }
                    ]).toArray()

                resolve(curruntAddress)
            } catch (error) {
                reject(error)

            }
        })
    },
    editUserAddress: (addressData, AddressID, userId) => {
        let Address = parseInt(AddressID)
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION)
                    .updateOne({ _id: objectId(userId), 'Address.AddressId': Address }, {
                        $set: {
                            "Address.$.Name": addressData.Name,
                            "Address.$.Place": addressData.Place,
                            "Address.$.Mobile": addressData.Mobile,
                            "Address.$.House": addressData.House,
                            "Address.$.Landmark": addressData.LandMark,
                            "Address.$.Town": addressData.Town,
                            "Address.$.Pin": addressData.Pin

                        }
                    }).then((response) => {
                        //  console.log(EditAddress,"Editt Address");
                        console.log(response, "Response");
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }

        })
    },
    deleteUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION).deleteOne({ _id: objectId(userId) }).then((data) => {
                    resolve(data)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION)
                    .updateOne({ _id: objectId(userId) }, {
                        $set: {
                            User: false
                        }
                    }).then((response) => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    unBlockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION)
                    .updateOne({ _id: objectId(userId) }, {
                        $set: {
                            User: true
                        }
                    }).then((response) => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }

        })
    },
    addToCart: (proId, userId) => {

        return new Promise(async (resolve, reject) => {
            try {

                let proObj = {
                    item: objectId(proId),
                    quantity: parseInt(1)
                }
                let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })

                if (userCart) {
                    let proExist = userCart.products.findIndex(product => product.item == proId)

                    if (proExist != -1) {
                        db.get().collection(collections.CART_COLLECTION)
                            .updateOne({ user: objectId(userId), 'products.item': objectId(proId) }, {
                                $inc: { 'products.$.quantity': 1 },




                            }).then(() => {
                                resolve()
                            })
                    } else {
                        db.get().collection(collections.CART_COLLECTION)
                            .updateOne({ user: objectId(userId) },
                                {

                                    $push: {
                                        products: proObj
                                    }

                                }
                            ).then((response) => {
                                resolve()
                            })

                    }


                } else {
                    let cartObj = {
                        user: objectId(userId),
                        products: [proObj]
                    }
                    db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                        resolve()
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    removeFromCart: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ user: objectId(userId) }, {
                        $pull: {
                            products: { item: objectId(proId) }
                        }
                    }).then((response) => {
                        console.log("hallo");
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    getWishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let wishlistItems = await db.get().collection(collections.USER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(userId) }
                    },
                    {
                        $unwind: '$wishlist'
                    },

                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'wishlist',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    }


                ]).toArray()
                console.log("wishlistItems", wishlistItems);
                if (wishlistItems.length != 0) {

                    resolve(wishlistItems)
                } else {
                    resolve()
                }
            } catch (error) {
                reject(error)
            }

        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray()
                console.log(cartItems);
                resolve(cartItems)
            } catch (error) {
                reject(error)
            }
        })
    },
    getCartCount: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            try {

                let count = 0
                let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })

                if (cart) {
                    count = cart.products.length

                }
                resolve(count)
            } catch (error) {
                reject(error)
            }
        })
    },
    changeProductQuantity: (details) => {
        // console.log(details);

        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise(async (resolve, reject) => {
            try {

                if (details.count == -1 && details.quantity == 1) {
                    await db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ _id: objectId(details.cart) },
                            {
                                $pull: { products: { item: objectId(details.product) } }
                            }
                        ).then((response) => {
                            resolve({ removeProduct: true })
                        })

                } else {

                    console.log(details.quantity);
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                            {
                                $inc: { 'products.$.quantity': details.count }
                            }).then((response) => {

                                resolve({ status: true })
                            })

                }
            } catch (error) {
                reject(error)
            }

        })

    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let cart = await db.get().collection(collections.CART_COLLECTION).find({ user: objectId(userId) }).toArray()
                // console.log(cart,"cart");
                if (cart.length != 0) {
                    let length = cart[0].products.length
                    // console.log("length:",length);
                    if (length != 0) {


                        let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                            {
                                $match: { user: objectId(userId) }
                            },
                            {
                                $unwind: '$products'
                            },
                            {
                                $project: {
                                    item: '$products.item',
                                    quantity: '$products.quantity'
                                }
                            },
                            {
                                $lookup: {
                                    from: collections.PRODUCT_COLLECTION,
                                    localField: 'item',
                                    foreignField: '_id',
                                    as: 'product'
                                }
                            },
                            {
                                $project: {
                                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }
                                }
                            }

                        ]).toArray()
                        // console.log(total[0].total,"uvais");

                        resolve(total[0].total)
                    } else {
                        resolve()
                    }

                } else {
                    resolve()
                }
            } catch (error) {
                reject(error)
            }

        })

    },
    getsingleAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let cart = await db.get().collection(collections.CART_COLLECTION).find({ user: objectId(userId) }).toArray()
                if (cart.length != 0) {
                    let length = cart[0].products.length
                    if (length != 0) {
                        let singleTotal = await db.get().collection(collections.CART_COLLECTION).aggregate([
                            {
                                $match: { user: objectId(userId) }
                            },
                            {
                                $unwind: '$products'
                            },
                            {
                                $project: {
                                    item: '$products.item',
                                    quantity: '$products.quantity'
                                }
                            },
                            {
                                $lookup: {
                                    from: collections.PRODUCT_COLLECTION,
                                    localField: 'item',
                                    foreignField: '_id',
                                    as: 'product'
                                }
                            },
                            {
                                $project: {
                                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product.Price', 0] }
                                }
                            },
                            {
                                $project: { _id: 0, total: { $multiply: ['$product', '$quantity'] } }
                            }



                        ]).toArray()
                        console.log(singleTotal, "singleAmount");
                        resolve(singleTotal)
                    } else {
                        resolve()
                    }
                } else {
                    resolve()
                }
            } catch (error) {
                reject(error)
            }

        })

    },

    addToWishlist: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let wishProduct = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId), wishlist: { $in: [objectId(proId)] } })
                console.log("wishPJroduct:", wishProduct);
                if (wishProduct) {
                    db.get().collection(collections.USER_COLLECTION)
                        .updateOne({ _id: objectId(userId) }, {
                            $pull: { 'wishlist': objectId(proId) }
                        }).then((response) => {
                            resolve({ removeproductFromWishlist: true })
                        })
                } else {
                    db.get().collection(collections.USER_COLLECTION)
                        .updateOne({ _id: objectId(userId) },
                            {

                                $push: { wishlist: objectId(proId) }

                            }
                        ).then((response) => {
                            resolve({ addToWishlist: true })
                        })
                }

                // let length=user[0].wishlist.length
                console.log(proId, "prrr");
            } catch (error) {
                reject(error)
            }
        })

    },
    removeProductFromWishlist: (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.USER_COLLECTION)
                    .updateOne({ _id: objectId(userId) }, {
                        $pull: { 'wishlist': objectId(proId) }
                    }).then((response) => {
                        resolve({ removeproductFromWishlist: true })
                    })
            } catch (error) {
                reject(error)
            }



        })
    },
    placeOrder: (order, products) => {
        console.log(order,'MYORDER'); 
        order.Date=new Date()
         order.lastPrice=parseInt(order.LastPrice) 
        return new Promise(async (resolve, reject) => {
            try { 

                console.log(order,"adi skke");
                let status = order.payment === 'COD' ? 'placed' : 'pending'
                let today = new Date()
                let date = today.getDate() + "/" + today.getMonth() + "/" + today.getFullYear()
                let time = today.getHours() + "." + today.getMinutes()
                let DateTime = date + "," + time
                let orderObj = {
                    deliveryDeatails: {
                        Name: order.Name,
                        Place: order.Place, 
                        Mobile: order.Mobile,
                        House: order.House,
                        Landmark: order.Landmark,
                        Town: order.Town,
                        Pin: order.Pin
                    },
                    LastPrice:order.lastPrice,
                    userId: objectId(order.userId),
                    paymentMethod: order.payment,
                    products: products,
                    dateAndTime: DateTime,
                    ISOdate:order.Date,
                    status: status

                }
                await db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((result) => {
                    id = result.insertedId;
                    db.get().collection(collections.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })

                    resolve(id)
                })
            } catch (error) {
                reject(error)
            }

        })

    },
    applayCoupon: (couponDetails, userId) => {
        // console.log(couponDetails, "couponDetails");

        return new Promise(async (resolve, reject) => {
            try {

                let couponUser = await db.get().collection(collections.COUPON_COLLECTION).findOne({ users: { $in: [objectId(userId)] } })
                // let coupon=  await db.get().collection(collections.COUPON_COLLECTION).findOne({couponCode:couponDetails.userCoupon})
                // console.log(coupon,userId,"coooo");
                let userCoupon = await db.get().collection(collections.COUPON_COLLECTION).aggregate([
                    {
                        $match: { couponCode: couponDetails.userCupon }
                    },
                    {
                        $match: { users: { $in: [objectId(userId)] } }
                    },
                    {
                        $project: {
                            users: 1, _id: 0, descountPrice: 1, ExpiryDate: 1
                        }
                    },
                    {
                        $unwind: '$users'
                    }
                ]).toArray()


                console.log(userCoupon, "coupenDetails");
                //console.log(userCoupon[0].descountPrice,"couponUser");


                if (userCoupon.length != 0) {
                    resolve({ Error: true })
                } else {

                    // console.log(findCoupon,"findCoupon");

                    db.get().collection(collections.COUPON_COLLECTION)
                        .updateOne({ couponCode: couponDetails.userCupon },
                            {
                                $push: { users: objectId(userId) }

                            }).then(async () => {
                                let Coupon = await db.get().collection(collections.COUPON_COLLECTION).aggregate([
                                    {
                                        $match: { couponCode: couponDetails.userCupon }
                                    },
                                    {
                                        $match: { users: { $in: [objectId(userId)] } }
                                    },
                                    {
                                        $project: {
                                            users: 1, _id: 0, descountPrice: 1, ExpiryDate: 1
                                        }
                                    },
                                    {
                                        $unwind: '$users'
                                    }
                                ]).toArray()
                                let ExprDate = Coupon[0].ExpiryDate
                                let currentDate = new Date()
                                // console.log(ExprDate, "ExprDate");
                                let couponPrice = Coupon[0].descountPrice
                               // console.log(couponPrice, "jjjj");
                                if (ExprDate < currentDate) {
                                   // console.log("DateError");
                                    resolve({ DateError: true })

                                } else {

                                    resolve(couponPrice)
                                }
                            })
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    getUserDescount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let userCoupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ users: { $in: [objectId(userId)] } })
                console.log(userCoupon, "userCOOOO{{");
                if (userCoupon) {
                    let length = userCoupon.users.length

                    if (length != 0) {

                        resolve(userCoupon.descountPrice)
                    } else {
                        resolve()
                    }

                } else {
                    resolve()
                }
            } catch (error) {
                reject(error)
            }



        })

    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                //console.log(userId, "usr");
                let orders = await db.get().collection(collections.ORDER_COLLECTION)
                    .find({ userId: objectId(userId) }).toArray()


                //  console.log(date,time,"date");
                resolve(orders)
            } catch (error) {
                reject(error)
            }
        })
    },
    getOrderProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let orderProducts = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: { userId: objectId(userId) }
                    },
                    {
                        $unwind: "$products"
                    },
                    
                    {
                        $project: { item: '$products.item', qunatity: '$products.quantity', date: '$dateAndTime', status: '$status',total:'$LastPrice' }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'orderProducts'
                        }
                    },
                    {
                        $unwind: '$orderProducts'
                    }


                ]).sort({ _id: -1 }).toArray()
               
                console.log(orderProducts, "ordeeer");
                resolve(orderProducts)
            } catch (error) {
                reject(error)
            }
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {

                console.log(userId); 
                let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
                // console.log(cart,"CART");
                resolve(cart.products)
            } catch (error) {
                reject(error)
            }
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise(async (resolve, reject) => {
            try {

                console.log(total, "totalINR");
                //  var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })

                instance.orders.create({
                    amount: total * 100,
                    currency: "INR",
                    receipt: "" + orderId,
                    notes: { 
                        key1: "value3",
                        key2: "value2"
                    }
                }, (err, order) => {
                    if (err) {
                        console.log(err,"error");
                    } else {
                        resolve(order)

                        console.log(order,"order"); 
                    }
                })
            } catch (error) {
                reject(error)
            }



        })
    },
    verifyPayment: (deatails) => {
        return new Promise(async (resolve, reject) => {
            

                const crypto = require('crypto')
                let hmac = crypto.createHmac('sha256', 'nI9kMzJ9Cu7siJOXHo5rXrQg')
                hmac.update(deatails['payment[razorpay_order_id]'] + '|' + deatails['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                
                if (hmac == deatails['payment[razorpay_signature]']) {
                    console.log("its not  problom");
                    resolve()
                } else {
                    reject()
                }
           
        })
    },
     changePaymentStatus: (orderId) => {

        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.ORDER_COLLECTION)
                    .updateOne({ _id: objectId(orderId) },
                        {
                            $set: {
                                status: 'placed'
                            }
                        }
                    ).then(() => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    productSearch:(key)=>{
        return new Promise(async(resolve,reject)=>{
            try {
               let products= await db.get().collection(collections.PRODUCT_COLLECTION).find({Name:{$regex:key,$options:"ix"}}).toArray()
               console.log(products);
               resolve(products)
            } catch (error) {
                reject()
                
            }
        })
    },
    singleProductOrder:(proId,userId)=>{
        console.log(proId);
        return new Promise(async(resolve,reject)=>{
            try {
                let product=await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match:{user:objectId(userId)}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $match:{'products.item':objectId(proId)}
                    },
                    {
                        $project:{
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }
                    
                    
                ]).toArray()
                    console.log(product,"singleProducts");
                    resolve(product)
            

                
            } catch (error) {
                reject(error)
                
            }
        })
    },
    orderCancel:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await db.get().collection(collections.ORDER_COLLECTION).update({_id:objectId(proId)},{
                    $set:{status:'Canceld'} 
                    
                     
                })
                let status=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(proId)}
                    },
                    {
                        $project:{
                            status:1,_id:0
                        }
                    }
                ]).toArray()
                console.log(status,'stttaaaatus');
                resolve(status)
                
                
            } catch (error) {
                reject(error)
            }
        })
    },
    getOrderFullDetals:(orderId,userId)=>{
        //console.log(userId,'userIIIDD');
        return new Promise(async(resolve,reject)=>{
            try {
                let products=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(orderId)}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            productItem:'$products.item',
                            qunatity:'$products.quantity'

                        }
                    },
                    {
                        $lookup:{
                            from:collections.PRODUCT_COLLECTION,
                            localField:'productItem',
                            foreignField:'_id',
                            as:'products'
                        }
                    },
                    {
                        $unwind:'$products'
                    }
                ]).toArray()
                //
                //console.log(userAddres,'singelProducdt');
                resolve(products)
                
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getOrderAddress:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let userAddres=await db.get().collection(collections.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
                resolve(userAddres)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getSingleProduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let product=await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
                resolve(product)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getAllCoupon:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let coupon=await db.get().collection(collections.COUPON_COLLECTION).find().toArray()
                console.log(coupon,'coooo');
                resolve(coupon)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    // getDataToInvoive:(proId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         try {
    //             let details=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
    //                 {
    //                     $match:{_id:objectId(proId)}
    //                 },
    //                 {
    //                     $unwind:'$products'
    //                 },
    //                 {
    //                     $lookup:{
    //                         from:collections.PRODUCT_COLLECTION,
    //                         localField:'products.item',
    //                         foreignField:'_id',
    //                         as:'productDetails'
    //                     }
    //                 },
    //                 {
    //                     $unwind:'$productDetails'
    //                 }
    //             ]).toArray()
    //             console.log(details,'lll');
    //             resolve(details)
    //         } catch (error) {
    //             reject(error)
    //         }
    //     })
    // }
    // ==========================================================
   

}