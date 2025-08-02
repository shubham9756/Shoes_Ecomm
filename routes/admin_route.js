var express = require('express')
var exe = require('./../connection')
var router =express.Router()

function checkLogin(req,res,next){
    if(req.session.admin){
        next()
    }else{  
        res.redirect('/admin_login')
    }   
} 
router.use(checkLogin);


// Admin Dashbord Page
router.get('/',function(req,res){
    res.render('admin/home.ejs')
})

// Admin Brand Page
router.get('/brand',async function(req,res){
    var sql = `SELECT * FROM product_brands`
    var result = await exe(sql)
    res.render('admin/product_brands.ejs',{result})
    // res.send(result)
})
router.post('/save_brand',async function(req,res){
    var d = req.body;
    var filename =""
    if(req.files){
        var filename =new Date().getTime()+req.files.image.name
        req.files.image.mv('public/Brand/'+filename)
    }
    try{
    var sql = `INSERT INTO product_brands(product_brand_name,brand_img)VALUES(?,?)`
    var result = await exe(sql,[d.brand_name,filename])
    }catch(error){
        console.log(error)
        res.send('Data Not Found')

    }
    // res.send(/)
    res.redirect('/admin/brand')
})
router.get('/edit_brand/:id',async function(req,res){
    id = req.params.id
    var result =await exe(`SELECT * FROM product_brands WHERE product_brand_id = ${id}`)
    res.render('admin/brand_edit.ejs',{result})
})
router.post('/update_brand',async function (req,res){
    var d= req.body;
    var filename =""
    if(req.files){
        var filename = new Date().getTime()+req.files.image.name;
        req.files.image.mv('public/Brand/'+filename)
    }
    var sql = `UPDATE product_brands SET product_brand_name = ? ,brand_img = ? WHERE product_brand_id = ?`
    var result = await exe(sql,[d.brand_name,filename,d.product_brand_id])
    // res.send(result)
    res.redirect('/admin/brand')
})
router.get('/delete/:id',async function(req,res){
    var id = req.params.id
    try{
    var result = await exe(`DELETE FROM product_brands WHERE product_brand_id = '${id}'`)
    } catch(error){
        res.send("<h1>It Is Not Possible Please Delete The brand product and after delete the brand</h1>")
    }// res.render('/admin/brand')
    res.send(result)
})

// Admin Style Page
router.get('/style',async function(req,res){
    var sql = `SELECT * FROM product_styles`
    var result = await exe(sql)
    res.render('admin/product_style.ejs',{result})
})
router.post('/save_style',async function(req,res){
    var d = req.body;
    var filename =""
    if(req.files){
        var filename =new Date().getTime()+req.files.image.name
        req.files.image.mv('public/Style/'+filename)
    }
    try{
    var sql = `INSERT INTO product_styles(product_style_name,style_img)VALUES(?,?)`
    var result = await exe(sql,[d.style_name,filename])
    }catch(error){
        console.log(error)
        res.send('Data Not Found')

    }
    // res.send(/)
    res.redirect('/admin/style')
})
router.get('/edit_style/:id',async function(req,res){
    var id = req.params.id;
    var result = await exe(`SELECT * FROM product_styles WHERE product_style_id = '${id}'`)
    res.render('admin/edit_style.ejs',{result})
})
router.post('/update_style',async function(req,res){
    var d =req.body;
    var filename = ""
    if(req.files){
        var filename = new Date().getTime()+req.files.image.name;
        req.files.image.mv('public/Style/'+filename)
    }
    var sql = `UPDATE product_styles SET product_style_name = ?,style_img = ? WHERE product_style_id = ?`
    var result = await exe(sql,[d.style_name,filename,d.product_style_id])
    // res.send(result)
    res.redirect("/admin/style")
})
router.get('/delete_style/:id',async function(req,res){
    var id = req.params.id;
    try{
    var result = await exe(`DELETE FROM product_styles WHERE product_style_id = '${id}'`)
    }catch(error){
        res.send("<h1>It Is Not Possible Please Delete The Style product and after delete the brand</h1>")
    }
    // res.redirect("/admin/style")
})

// Admin Type Page
router.get('/type',async function(req,res){
    var sql = `SELECT * FROM product_types`
    var result = await exe(sql)
    res.render('admin/product_type.ejs',{result})
})
router.post('/save_type',async function(req,res){
    var d = req.body;
    var filename =""
    if(req.files){
        var filename =new Date().getTime()+req.files.image.name
        req.files.image.mv('public/Type/'+filename)
    }
    try{
    var sql = `INSERT INTO product_types(product_type_name,type_img)VALUES(?,?)`
    var result = await exe(sql,[d.type_name,filename])
    }catch(error){
        console.log(error)
        res.send('Data Not Found')

    }
    // res.send(/)
    res.redirect('/admin/type')
})
router.get('/edit_type/:id',async function(req,res){
    var id = req.params.id;
    var result = await exe(`SELECT * FROM product_types WHERE product_type_id = '${id}'`)
    res.render('admin/edit_type.ejs',{result})
})
router.post('/update_type',async function(req,res){
    var d =req.body;
    var filename = ""
    if(req.files){
        var filename = new Date().getTime()+req.files.image.name;
        req.files.image.mv('public/Type/'+filename)
    }
    var sql = `UPDATE product_types SET product_type_name = ?,type_img = ? WHERE product_type_id = ?`
    var result = await exe(sql,[d.type_name,filename,d.product_type_id])
    // res.send(result)
    res.redirect("/admin/type")
})
router.get('/delete_type/:id',async function(req,res){
    var id = req.params.id;
    try{
    var result = await exe(`DELETE FROM product_types WHERE product_type_id = '${id}'`)
    }catch(error){
        res.send("<h1>It Is Not Possible Please Delete The Type product and after delete the brand</h1>")
    }
    // res.redirect("/admin/style")
})


// Admin All Product Page
router.get('/product_list',async function(req,res){
    var sql = `SELECT * FROM products`
    var result  = await exe(sql)
    res.render('admin/product_list.ejs',{result})
})

router.get('/add_product',async function(req,res){
    var types =await exe( `SELECT * FROM product_types`)
    var brands =await exe( `SELECT * FROM product_brands`)
    var style =await exe( `SELECT * FROM product_styles`)
    res.render('admin/all_product.ejs',{types,brands,style})
})
router.post('/save_product',async function(req,res){
    var d = req.body;
    var difference = d.product_market_price -  d.product_price ;
    var discount = ((difference) /d.product_market_price) * 100 ;
    var filename = "";
    if (req.files ) {
        filename = new Date().getTime() + req.files.product_main_image.name;
        req.files.product_main_image.mv('public/product/' + filename);
    }
    var sql = `INSERT INTO products(product_name,product_market_price,apply_discount_percent,product_price,product_description,product_main_image,product_rating,product_is_trending,product_brand_id,product_style_id,product_for,product_kid_type,product_type_id,offer_expiry_date,product_added_date,product_stock,product_color)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    var result = await exe(sql,[d.product_name,d.product_market_price,discount,d.product_price,d.product_description,filename,d.product_rating,d.product_is_trending,d.product_brand_id,d.product_style_id,d.product_for,d.product_kid_type,d.product_type_id,d.offer_expiry_date,d.product_added_date,d.product_stock,d.product_color])
    // res.redirect('/admin/add_product')
    res.send(req.body)
})

router.get('/slider',async function(req,res){
    var result = await exe(`SELECT * FROM slider`)
    res.render('admin/slider.ejs',{result})
})
router.post('/save_slider',async function(req,res){
    var d = req.body;
    var filename =""
    if(req.files){
        var filename =new Date().getTime()+req.files.image.name;
        req.files.image.mv('public/slider/'+filename)
    }
    var sql =  `INSERT INTO slider (slider_title,slider_image,slider_description,slider_button,slider_button_link)VALUES(?,?,?,?,?)`
    var result = await exe(sql,[d.slider_title,filename,d.slider_dec,d.slider_button,d.slider__button_link])
    // res.send(result)
    res.redirect('/admin/slider')
})
router.get('/edit_slider/:id',async function(req,res){
    var id = req.params.id;
    var result =await exe(`SELECT * FROM slider WHERE slider_id = '${id}'`)
    res.render("admin/edit_slider.ejs",{result})
})
router.get('/delete_slider/:id',async function(req,res){
    var id = req.params.id;
    try{
    var result = await exe(`DELETE FROM slider WHERE slider_id = '${id}'`)
    }catch(error){
        res.send('Not Delete the Slider')
    }
    res.render("admin/slider")
})

// Admin banner Section

router.get('/banner',async function(req,res){
    var result = await exe(`SELECT * FROM promotional_banner`)
    res.render('admin/banner_section.ejs',{result})
})

router.get('/pending_orders',async function(req,res){
    var sql = `SELECT * FROM orders WHERE order_status = 'placed'`
    var result =await exe(sql)
    res.render('admin/pending_orders.ejs',{result})
})
router.get('/complete_order',async function(req,res){
    var sql = `SELECT * FROM orders WHERE order_status = 'delivered'`
    var result =await exe(sql)
    res.render('admin/complete_orders.ejs',{result})
})
router.get('/dispatch_order',async function(req,res){
    var sql = `SELECT * FROM orders WHERE order_status = 'dispatched'`
    var result =await exe(sql)
    res.render('admin/complete_orders.ejs',{result})
})
router.get('/order_details/:id',async function(req,res){
    var sql = `SELECT * FROM orders WHERE order_id = '${req.params.id}'`
    var order = await exe(sql) 
    var sql2 = `SELECT * FROM order_products WHERE order_id = '${req.params.id}'`
    var products = await exe(sql2)
    console.log(products, order)
    res.render('admin/order_details.ejs',{order,products})
})
router.get('/dispatch_order/:id',async function(req,res){
    var sql = `UPDATE orders SET order_status = 'dispatched' WHERE order_id = '${req.params.id}'`
    var resut2 =await exe(`SELECT * FROM orders WHERE order_id = '${req.params.id}'`)
    var result = await exe(sql)
    res.redirect('/admin/pending_orders')
})
router.get('/cancelled_order/:id',async function(req,res){
    var sql = `UPDATE orders SET order_status = 'cancelled' WHERE order_id = '${req.params.id}'`
    var result = await exe(sql)
    res.redirect('/admin/pending_orders')
})
router.get('/cancelled_orders',async function(req,res){
    var sql = `SELECT * FROM orders WHERE order_status = 'cancelled'`
    var result = await exe(sql)
    console.log(result)
    res.render('admin/cancelled.ejs',{result})
})
router.get('/return_order',async function(req,res){
     var sql = `SELECT * FROM orders WHERE order_status = 'returned'`
    var result = await exe(sql)
    res.render('admin/return_order.ejs',{result})
})

module.exports = router