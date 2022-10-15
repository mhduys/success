const { resolve, reject } = require('promise');
var db = require('../config/connection')
var collections = require('../config/collections')
var objectId = require('mongodb').ObjectId
module.exports = {
    addProduct: (product, callback) => {

        console.log(product);
        product.Price = parseInt(product.Price)
        product.time = Date.now()
        product.status = false
        db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data) => {

            callback(data.insertedId)
        })
    },
    getCategoryProducts: (category) => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collections.PRODUCT_CATEGORY).aggregate([
                    {
                        $match: { productCategory: category }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'productCategory',
                            foreignField: 'Category',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            product: 1, _id: 0
                        }
                    }
                ]).toArray()
                resolve(products[0].product)
            } catch (error) {
                reject(error)
            }
        })
    },
    GetAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collections.PRODUCT_COLLECTION).find({ status: false }).toArray()
                console.log(products, "productttts");
                resolve(products)
            } catch (error) {
                reject(error)

            }
        }) 
    },
    getAllProducts: (perPage,skipNo) => {
        return new Promise(async (resolve, reject) => { 
            try {
                let products = await db.get().collection(collections.PRODUCT_COLLECTION).find({ status: false }).limit(perPage).skip(skipNo).toArray()
                console.log(products, "productttts");
                resolve(products)
            } catch (error) {
                reject(error)

            }
        })
    },
    deleteProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let imageDlt = null
                await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((response) => {
                    imageDlt = response.Image
                    db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: objectId(productId) }, {
                        $set: {
                            status: true
                        }
                    })
                    resolve(imageDlt)
                })
            } catch (error) {
                reject(error)

            }
        })
    },
    getProductDetails: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((product) => {
                    console.log(product);
                    resolve(product)
                })
            } catch (error) {
                reject(error)

            }
        })
    },
    getProductToHome: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let getProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find().sort({ time: -1 }).limit(4).toArray()

                resolve(getProducts)
            } catch (error) {
                reject(error)

            }
        })
    },
    updateProduct: (proId, proDetails) => {
        let Price = parseInt(proDetails.Price)

        return new Promise(async (resolve, reject) => {
            try {

                let oldImage = null
                await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                    if (proDetails.Image.length == 0) {
                        proDetails.Image = product.Image
                    } else {
                        oldImage = product.Image
                    }
                })
                await db.get().collection(collections.PRODUCT_COLLECTION)
                    .updateOne({ _id: objectId(proId) }, {
                        $set: {
                            Name: proDetails.Name,
                            Price: Price,
                            Category: proDetails.Category,
                            Description: proDetails.Description,
                            Elastic_Closure: proDetails.Elastic_Closure,
                            Rounded_Corner: proDetails.Rounded_Corner,
                            Bind: proDetails.Bind,
                            Size: proDetails.Size,
                            Gsm: proDetails.Gsm,
                            Sheet: proDetails.Sheet,
                            Star:proDetails.Star,
                            Discount:proDetails.Discount,
                            Offer:proDetails.Offer,
                            Id:proDetails.Id,
                            Image: proDetails.Image
                        }
                    }).then((response) => {
                        resolve(oldImage)
                    })
            } catch (error) {
                reject(error)

            }
        })
    },
    addCategory: (categoryName) => {
        categoryName.productCategory=categoryName.productCategory.toUpperCase() 
       
   

        
        
        console.log(categoryName.productCategory);
        return new Promise(async (resolve, reject) => { 
            try {

                let response = {}
                let category = await db.get().collection(collections.PRODUCT_CATEGORY).findOne({productCategory:categoryName.productCategory})
                console.log(category,"category");
                if (category) {
                    response.status = false
                    resolve({ dataError: true })
                } else {
                    console.log("true");
                    response.status = true
                    db.get().collection(collections.PRODUCT_CATEGORY).insertOne(categoryName).then((data) => {
                        resolve(data)
                        console.log("hahaha");
                    })
                }
            } catch (error) {
                reject(error)

            }
        })
    },
    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let category = await db.get().collection(collections.PRODUCT_CATEGORY).find().toArray()
                resolve(category)
            } catch (error) {
                reject(error)

            }
        })
    },
    // ================================COUPON=======================
    addCoupon: (couponDetails) => {
        // couponDetails.minimumPurchers=couponDetails.descountPrice*2
        couponDetails.startingDate = new Date()
        couponDetails.ExpiryDate = new Date(couponDetails.ExpiryDate)
        couponDetails.descountPrice = parseInt(couponDetails.descountPrice)
        return new Promise(async (resolve, reject) => {
            try {

                await db.get().collection(collections.COUPON_COLLECTION).insertOne(couponDetails).then((response) => {
                    //console.log("coupon Add");
                    resolve()
                })
            } catch (error) {
                reject(error)

            }
        })
    },
    getCoupenDetails: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let coupon = await db.get().collection(collections.COUPON_COLLECTION).find().toArray()
                resolve(coupon)
            } catch (error) {
                reject(error)

            }
        })
    },
    getOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let products = await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
                resolve(products)
            } catch (error) {
                reject(error)

            }

        })
    },
    getSingleOrder: (proId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let product = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(proId) }
                    },
                    {
                        $unwind: '$products'
                    }

                ]).toArray()
                resolve(product)
            } catch (error) {
                reject(error)

            }
        })
    },
    getSingleOrderProductDeatails: (proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let proDeatails = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(proId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: { products: 1 }
                    },
                    {
                        $lookup: {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'products.item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    }
                ]).toArray()
                console.log(proDeatails, "proDeatails");
                resolve(proDeatails)
            } catch (error) {
                reject(error)
            }
        })
    },
    changeOrderStatus: (data) => {
        let proId = data.proId
        let status = data.progressValue
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.ORDER_COLLECTION)
                    .updateOne({ _id: objectId(proId) }, {
                        $set: { status: status }
                    })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },
    // ================================COUPON=======================
    usersSearch:(key)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let users=await db.get().collection(collections.USER_COLLECTION).find({Name:{$regex:key,$options:"ix"}}).toArray()
                resolve(users)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    orderSearch:(key)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let product=await db.get().collection(collections.ORDER_COLLECTION).find({status:{$regex:key,$options:"ix"}}).toArray()
                resolve(product)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    allProductSearc:(key)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let product=await db.get().collection(collections.PRODUCT_COLLECTION).find({Name:{$regex:key,$options:"ix"}}).toArray()
                resolve(product)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getfilterProduct:(category)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let product= await db.get().collection(collections.PRODUCT_COLLECTION).find({Category:category.notebook}).toArray()
                resolve(product)                
            } catch (error) {
                
            }
        })
    },
    getTotalUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalUsers=await db.get().collection(collections.USER_COLLECTION).find().count()
                console.log(totalUsers);
                resolve(totalUsers)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalProducts=await db.get().collection(collections.PRODUCT_COLLECTION).find().count()
                resolve(totalProducts)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalCategorys:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalCategorys=await db.get().collection(collections.PRODUCT_CATEGORY).find().count()
                resolve(totalCategorys)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalCoupon:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalCoupon=await db.get().collection(collections.COUPON_COLLECTION).find().count()
                resolve(totalCoupon)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalOrders=await db.get().collection(collections.ORDER_COLLECTION).find().count()
                resolve(totalOrders)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalSales:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalSales=await db.get().collection(collections.ORDER_COLLECTION).find({status:'placed'}).count()
              
                resolve(totalSales,"salws")
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalShipped:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalShipped=await db.get().collection(collections.ORDER_COLLECTION).find({status:'shipped'}).count()
              console.log(totalShipped);
                resolve(totalShipped)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalCanceled:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalCnaceled=await db.get().collection(collections.ORDER_COLLECTION).find({status:'Canceld'}).count()
             
                resolve(totalCnaceled)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalCOD:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalCOD=await db.get().collection(collections.ORDER_COLLECTION).find({paymentMethod:'COD'}).count()
             
                resolve(totalCOD)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalOnline:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalOnline=await db.get().collection(collections.ORDER_COLLECTION).find({paymentMethod:'ONLINE '}).count()
             
                resolve(totalOnline)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalDeleverd:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let totalDeleverd=await db.get().collection(collections.ORDER_COLLECTION).find({status:'deleverd'}).count()
              //console.log(totalShipped);
                resolve(totalDeleverd)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    getTotalRevenue:()=>{
        return new Promise(async(resolve,reject)=>{ 
            let totalRevenue=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $group:{
                        _id:null,
                        totalAmout:{$sum:'$LastPrice'}
                        
                    }
                }
            ]).toArray()
            
            resolve(totalRevenue)
            //console.log(total,"rev")
        
        
        })

    },
    totalRevenue:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let CODrevenue=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match:{paymentMethod:'COD'}
                    },
                    {
                        $group:{
                            _id:{
                                day:{$dayOfMonth:'$ISOdate'},
                                month:{$month:'$ISOdate'},
                                year:{$year:'$ISOdate'}
                            },
                            totalsum:{$sum:'$LastPrice'},

                        }
                        
                    },
                    {
                        $sort:{'_id.day':-1,'-id.month':-1,'_id.year':-1}
                    }
                ]).toArray()
                console.log(CODrevenue,"COD");
                resolve(CODrevenue)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    revenue:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let revenue=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    
                    {
                        $group:{
                            _id:{
                                day:{$dayOfMonth:'$ISOdate'},
                                month:{$month:'$ISOdate'},
                                year:{$year:'$ISOdate'}
                            },
                            totalsum:{$sum:'$LastPrice'},

                        }
                        
                    },
                    {
                        $sort:{'_id.day':-1,'-id.month':-1,'_id.year':-1}
                    }
                ]).toArray()
                console.log(revenue,"my");
                resolve(revenue)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    totalOnlineRevenue:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let OnlieRevenue=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match:{paymentMethod:'ONLINE '}
                    },
                    {
                        $group:{
                            _id:{
                                day:{$dayOfMonth:'$ISOdate'},
                                month:{$month:'$ISOdate'},
                                year:{$year:'$ISOdate'}
                            },
                            totalOnlineSum:{$sum:'$LastPrice'},

                        }
                        
                    },
                    {
                        $sort:{'_id.day':-1,'-id.month':-1,'_id.year':-1}
                    }
                ]).toArray()
               console.log(OnlieRevenue,"revenueeeeeeeee");
                resolve(OnlieRevenue)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    salesReport:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let salesDetails=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $unwind:'$products'
                    },
                    {
                        $lookup:{
                            from:collections.PRODUCT_COLLECTION, 
                            localField:'products.item',
                            foreignField:'_id',
                            as:'sales'
                        }
                    },
                    {
                        $unwind:'$sales'
                    },
                    {
                        $project:{
                            price:'$LastPrice',
                            quantity:'$products.quantity',
                            date:'$dateAndTime',
                            payment_method:'$paymentMethod',
                            product:'$sales.Name',
                            Id:'$_id'
                            
                        }
                    }
                   

                ]).toArray()
                console.log(salesDetails,'SalesDetails');
                resolve(salesDetails)
            } catch (error) {
                reject(error)
                
            }
        })
    },
    

    
}  