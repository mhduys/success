var adminHelper = require('../helpers/admin_helpers')
var productHelper = require('../helpers/product_helpers')
var userHelper = require('../helpers/user_helpers')
var isJson = require('is-json')
var json2xls = require('json2xls')
var fs = require('fs')

module.exports = {
    login: (req, res) => {
        let loginError = req.session.adminDataError
        if (req.session.admin) {
            res.redirect('/admin')
        } else {

            res.render('admin/admin_login', { loginError })
        }
    },
    getIndex: async function (req, res, next) {
        if (req.session.admin) {
            var addProduct
            let totalUsers = await productHelper.getTotalUsers()
            let totalProducts = await productHelper.getTotalProducts()
            let totalCategorys = await productHelper.getTotalCategorys()
            let totalCoupon = await productHelper.getTotalCoupon()
            let totalOrders = await productHelper.getTotalOrders()
            let totalSales = await productHelper.getTotalSales()
            let totalShipped = await productHelper.getTotalShipped()
            let totalCnaceled = await productHelper.getTotalCanceled()
            let totalDeleverd = await productHelper.getTotalDeleverd()
            let totalRevenue = await productHelper.getTotalRevenue()
            let totalCOD = await productHelper.getTotalCOD()
            let totalOnline = await productHelper.getTotalOnline()


            productHelper.getCategory().then((category) => {
                console.log(category);
                res.render('admin/admin_index', {
                    admin: true,
                    addProduct,
                    category,
                    totalUsers,
                    totalProducts,
                    totalCoupon,
                    totalCategorys,
                    totalOrders,
                    totalSales,
                    totalRevenue,
                    totalShipped,
                    totalDeleverd,
                    totalCnaceled,
                    totalCOD,
                    totalOnline

                });
            })
        } else {
            res.redirect('/admin/admin_login')

        }
    },
    getSalesInvoice: async (req, res, next) => {
        try {
            let salesReport = await productHelper.salesReport()
            console.log(salesReport,'report');
            salesReport = JSON.stringify(salesReport)
            var exceloutput=Date.now()+"output.xlsx"
            if (isJson(salesReport)) {
                var xls = json2xls(JSON.parse(salesReport));

                fs.writeFileSync(exceloutput, xls, 'binary');
                res.download(exceloutput,(err)=>{
                    if(err){
                        fs.unlinkSync(exceloutput)
                        res.send('unable to download this file')
                    }else{
                        fs.unlinkSync(exceloutput)
                    }
                })
            } else {
                res.send('invalid')
            }
        } catch (error) {
            next(error)
        }
    },
    getTotalRevenue: (req, res, next) => {
        // console.log("hi");
        try {
            productHelper.totalRevenue().then((COD) => {
                productHelper.totalOnlineRevenue().then((ONLINE) => {

                    res.json({ COD: COD, ONLINE: ONLINE })
                })

            })
        } catch (error) {
            next(error)

        }

    },
    getRevenue: (req, res, next) => {
        console.log("my");
        try {
            productHelper.revenue().then((response) => {
                console.log(response, 'uuuu');
                res.json(response)
            })


        } catch (error) {
            next(error)

        }
    },

    postLogin: (req, res, next) => {
        try {
            console.log(req.body);

            adminHelper.adminLogin(req.body).then((response) => {
                if (response.dataError) {
                    req.session.adminDataError = 'dataErrorrrr'
                    req.session.adminData = false
                    res.redirect('/admin/admin_login')
                } else if (response) {
                    req.session.admin = response
                    res.redirect('/admin')
                }
            })

        } catch (error) {
            next(error)

        }

    },
    getAddProduct: (req, res, next) => {
        try {
            productHelper.getCategory().then(async (category) => {
                console.log(category);
                let addproduct = true
                await productHelper.getCategory().then((category) => {

                    res.render('admin/add_products', { admin: true, addproduct, category })
                })
            })

        } catch (error) {
            next(error)
        }


    },
    postAddProduct: (req, res, next) => {
        try {
            const Images = []
            console.log(req.files.length);
            for (i = 0; i < req.files.length; i++) {
                Images[i] = req.files[i].filename
            }
            req.body.Image = Images


            productHelper.addProduct(req.body, (id) => {
                res.redirect('/admin')


            })

        } catch (error) {
            next(error)

        }


    },
    getCategory: async (req, res) => {
        try {
            let category = req.params.category
            console.log(category);
            if (req.session.admin) {

                productHelper.getCategoryProducts(category).then((products) => {
                    let product = products
                    productHelper.getCategory().then((category) => {

                        res.render('admin/category-products', { admin: true, product, category })
                    })
                    //console.log(product, "New");

                })


            } else {
                res.redirect('/admin/admin_login')
            }

        } catch (error) {
            next(error)

        }

    },
    getDeleteProduct: async (req, res) => {
        try {
            let proId = req.params.id

            var oldImage = await productHelper.deleteProduct(proId)
            await productHelper.getCategory().then((category) => {

                res.redirect('/admin/allProducts', { category })
            })

        } catch (error) {
            next(error)
        }

    },
    getLogout: (req, res) => {
        try {
            req.session.destroy()
            res.redirect('/admin/admin_login')
            req.session.admin = false

        } catch (error) {
            next(error)

        }

    },
    getEditProduct: (req, res) => {
        try {
            console.log(req.params.id);
            productHelper.getProductDetails(req.params.id).then((product) => {
                productHelper.getCategory().then((category) => {

                    res.render('admin/edit_products', { admin: true, product, category })
                })
            })

        } catch (error) {
            next(error)

        }

    },
    postEditProduct: async (req, res) => {
        try {
            let id = req.params.id
            const editImg = []
            for (i = 0; i < req.files.length; i++) {
                editImg[i] = req.files[i].filename
            }
            req.body.Image = editImg
            var oldImage = await productHelper.updateProduct(id, req.body)
            if (oldImage) {
                for (i = 0; i < oldImage.length; i++) {
                    var oldImagePath = path.join(__dirname, '../public/admin/product-images/' + oldImage[i])
                    fs.unlink(oldImagePath, function (err) {
                        if (err) {
                            return
                        }
                    })
                }
            }
            res.redirect('/admin/allProducts')
        } catch (error) {
            next(error)
        }
    },
    getAddCategory: (req, res) => {
        try {
            productHelper.getCategory().then((category) => {
                let Error = req.session.error
                res.render('admin/add-category', { admin: true, Error, category })
                req.session.error = false
            })
        } catch (error) {
            next(error)
        }
    },
    postAddCategory: (req, res, next) => {
        try {
            productHelper.addCategory(req.body).then((response) => {

                if (response.dataError) {
                    req.session.error = true
                    req.session.error = "This Category Allredy Avilable"
                    res.redirect('/admin/addCategory')

                } else {
                    res.redirect('/admin/addCategory')
                }
            })

        } catch (error) {
            next(error)
        }
    },
    getAllProduts: (req, res) => {
        try {
            productHelper.GetAllProducts().then((products) => {
                let productDisplay = products
                productHelper.getCategory().then((category) => {

                    res.render('admin/all-products', { admin: true, productDisplay, category })
                })

            })

        } catch (error) {
            next(error)
        }
    },
    getAllUsers: (req, res, next) => {
        try {
            userHelper.getAllUsers().then((userDatas) => {
                productHelper.getCategory().then((category) => {

                    res.render('admin/all-users', { admin: true, userDatas, category })
                })

            })

        } catch (error) {
            next(error)
        }
    },
    getDeleteUser: (req, res) => {
        try {
            let userId = req.params.id
            userHelper.deleteUser(userId).then((user) => {
                res.redirect('/admin/allUsers')
            })
        } catch (error) {
            next(error)
        }
    },
    getBlock: (req, res) => {
        try {
            let userId = req.params.id
            userHelper.blockUser(userId).then((user) => {
                res.redirect('/admin/allUsers')
            })

        } catch (error) {
            next(error)
        }
    },
    getUnblock: (req, res) => {
        try {
            let userId = req.params.id
            userHelper.unBlockUser(userId).then((user) => {
                res.redirect('/admin/allUsers')
            })

        } catch (error) {
            next(error)
        }
    },
    getCoupon: (req, res) => {
        try {
            productHelper.getCoupenDetails().then((coupon) => {
                productHelper.getCategory().then((category) => {

                    console.log(coupon, "coupon");

                    res.render('admin/coupon', { admin: true, coupon, category })
                })
            })

        } catch (error) {
            next(error)
        }
    },
    postAddCoupon: (req, res, next) => {
        try {
            productHelper.addCoupon(req.body).then(() => {
                res.redirect('/admin/coupon')
            })
        } catch (error) {
            next(error)
        }

    },
    getOrders: (req, res) => {
        try {
            productHelper.getOrders().then((products) => {
                productHelper.getCategory().then((category) => {

                    res.render('admin/orders', { admin: true, products, category })
                })

                //console.log(products,'jfjfjfjfjfjfjfjfjfjfjfjfjfjffjfjfj'); 
            })
        } catch (error) {
            next(error)
        }
    },
    getViewOrderDetails: (req, res) => {
        try {
            let proId = req.params.id
            console.log(proId, "proId");
            productHelper.getSingleOrder(proId).then((products) => {
                productHelper.getSingleOrderProductDeatails(proId).then((proDeatails) => {
                    productHelper.getCategory().then((category) => {

                        res.render('admin/orderDetails', { admin: true, products, proDeatails, category })
                    })

                })

            })
        } catch (error) {
            next(error)
        }
    },
    postPlaced: (req, res) => {
        try {
            //console.log(req.body,"boooooddyy");
            //console.log(req.params.value,"value");
            productHelper.changeOrderStatus(req.body).then((response) => {
                console.log(response, "bodddd");
                res.json({ placed: true })
            })
        } catch (error) {
            next(error)
        }
    },
    postShipped: (req, res) => {
        try {
            //console.log(req.params.value,"value");
            console.log(req.body, "boooooddyy");
            productHelper.changeOrderStatus(req.body).then((response) => {
                res.json({ shipped: true })
            })
        } catch (error) {
            next(error)
        }
    },
    postDeleverd: (req, res) => {
        try {
            console.log(req.body, "boooooddyy");
            console.log(req.params.value, "value");
            productHelper.changeOrderStatus(req.body).then((response) => {
                res.json({ deleverd: true })
            })
        } catch (error) {
            next(error)
        }
    },
    getSearch: (req, res, next) => {
        try {
            let key = req.query.searchKey
            //console.log(key,"key");
            productHelper.usersSearch(key).then((searchProducts) => {
                productHelper.getCategory().then((category) => {

                    res.render('admin/users-search-result', { admin: true, searchProducts, category })
                })
                // console.log(searchProducts);
            })

        } catch (error) {
            next(error)

        }
    },
    getSearchOrders: (req, res, next) => {
        try {
            let key = req.query.searchKey
            productHelper.orderSearch(key).then((result) => {
                productHelper.getCategory().then((category) => {

                    res.render('admin/search-order-status', { admin: true, result, category })
                })
            })
        } catch (error) {
            next(error)

        }
    },
    getSearchProducts: (req, res, next) => {
        try {
            let key = req.query.searchKey
            productHelper.allProductSearc(key).then((products) => {
                productHelper.getCategory().then((category) => {
                    res.render('admin/all-products', { admin: true, products, category })
                })
            })

        } catch (error) {
            next(error)

        }
    },
    getAllSalesReport:async(req,res,next)=>{
        try {
           let salesReport=await productHelper.salesReport()
            res.render('admin/sales-report',{admin:true,salesReport})
        } catch (error) {
            next(error)
            
        }
    }
}