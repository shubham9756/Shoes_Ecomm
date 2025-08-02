var express = require('express')
var router = express.Router()
var url = require('url')
var send_mail = require('./send_otp')
var exe = require('./../connection')


router.get('/', async function (req, res) {
    var result = await exe(`SELECT * FROM slider`)
    var brand = await exe(`SELECT * FROM product_brands`)
    var style = await exe(`SELECT * FROM product_styles`)
    var discount = await exe(`SELECT * FROM products ORDER BY apply_discount_percent DESC LIMIT 5`)
    var trending = await exe(`SELECT * FROM products WHERE product_is_trending = 'yes'`)
    res.render('user/home.ejs', { result, trending, brand, style, discount })
})
router.get('/contact',function (req, res) {
    res.render('user/contact.ejs')
});
router.get('/product_list', async function (req, res) {
    var sql = `SELECT * FROM products`
    var data = url.parse(req.url, true).query;
    if (data.cat) {
        if (data.cat == 'Mens') {
            var sql = `SELECT * FROM products WHERE product_for = 'Male'`;
        }
        if (data.cat == 'Women') {
            var sql = `SELECT * FROM products WHERE product_for = 'Female'`;
        }
        if (data.cat == 'Boys') {
            var sql = `SELECT * FROM products WHERE product_for = 'Kids' AND product_kid_type ='Boys'`;
        }
        if (data.cat == 'Girl') {
            var sql = `SELECT * FROM products WHERE product_for = 'Kids' AND product_kid_type ='Girls'`;
        }
    }
    var mens = await exe(sql)
    // res.send(data)
    res.render('user/product_list.ejs', { mens })
})

router.get('/details/:id', async function (req, res) {
    var id = req.params.id;
    var result = await exe(`SELECT * FROM products WHERE product_id = '${id}'`)
    var is_login = (req.session.user_id) ? true : false;
    res.render("user/product_details.ejs", { result, is_login })
    // res.send(result )

})
router.get('/buy_now/:id', checkLogin, async function (req, res) {
    var url_data = url.parse(req.url, true).query;
    var id = req.params.id
    var sql = `SELECT * FROM products WHERE product_id = '${id}'`
    var result = await exe(sql)
    res.render('user/buy_now.ejs', { result, url_data })
})

router.post('/send_otp', function (req, res) {
    var d = req.body;
    var otp = parseInt(Math.random() * 9000 + 999); // Generates 4-digit OTP
    console.log("OTP:", otp);
    var subject = `Shoes Ecommerce Website Verification : ${otp}`;
    var message = `Your One Time Password (OTP): ${otp}`;
    send_mail(d.email, subject, message);
    req.session.email = d.email;
    req.session.otp = otp;
    res.send({ status: "otp_sent", email: req.session.email });
});
async function transferData(req, res) {
    var carts = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    console.log(carts)
    for (var i = 0; i < carts.length; i++) {
        var customer_id = req.session.user_id;
        var product_id = carts[i].product_id;
        var qty = carts[i].qty;
        var size = carts[i].size;
        var sql = `INSERT INTO carts (customer_id, product_id, qty, size) VALUES (?, ?, ?, ?)`;
        var result = await exe(sql, [customer_id, product_id, qty, size]);
        console.log("Cart added to database:", result);
    }
}
router.post('/verifyotp', async function (req, res) {
    var d = req.body;
    console.log(d.otp)
    if (req.session.otp == d.otp) {
        var email = req.session.email;
        var sql = `SELECT * FROM customers WHERE customer_email = '${email}'`;  // Changed to match email

        var customer = await exe(sql);

        if (customer.length > 0) {
            req.session.user_id = customer[0].customer_id;
            await transferData(req, res);
            res.send({ status: 'success', new_user: false });
        } else {
            var sql2 = `INSERT INTO customers (customer_email) VALUES ('${email}')`;
            var result = await exe(sql2);
            req.session.user_id = result.insertId;
            await transferData(req, res);
            res.send({ status: 'success', new_user: true });
        }
    } else {
        res.send({ status: false, message: "Invalid OTP" });
    }
});

function checkLogin(req, res, next) {
    if (req.session.user_id) {
        next();
    } else {
        res.redirect('/')
    }
}

router.post('/checkout', checkLogin, async function (req, res) {
    var d = req.body;
    console.log(d);

    var customer_id = req.session.user_id;
    var payment_status = "pending";
    var order_date = new Date().toISOString().slice(0, 10);
    var order_status = "placed";

    // Step 1: Calculate total_amount
    let total_amount = 0;
    for (let i = 0; i < d.product_id.length; i++) {
        const product_info = await exe(`SELECT * FROM products WHERE product_id = ?`, [d.product_id[i]]);
        const qty = Number(d.qty[i]);
        total_amount += qty * product_info[0].product_price;
    }

    // Step 2: Insert into orders table
    const sql = `INSERT INTO orders (customer_id, fullname, mobile, country, state, city, area, address, pincode, total_amount, payment_method, payment_status, order_date, order_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await exe(sql, [
        customer_id, d.fullname, d.mobile, d.country, d.state, d.city, d.area, d.address, d.pincode,
        total_amount, d.payment_mode, payment_status, order_date, order_status
    ]);

    const order_id = result.insertId;

    // Step 3: Insert into order_products table
    for (let i = 0; i < d.product_id.length; i++) {
        const product_info = await exe(`SELECT * FROM products WHERE product_id = ?`, [d.product_id[i]]);
        const qty = Number(d.qty[i]);
        const product_total = qty * product_info[0].product_price;

        const sql2 = `INSERT INTO order_products (order_id, customer_id, fullname, mobile, product_id, product_name, product_size, product_market_price, product_discount, product_price, product_qty, product_total)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await exe(sql2, [
            order_id,
            customer_id,
            d.fullname,
            d.mobile,
            d.product_id[i],
            product_info[0].product_name,
            d.size[i],
            product_info[0].product_market_price,
            product_info[0].apply_discount_percent,
            product_info[0].product_price,
            qty,
            product_total
        ]);
    }

    res.redirect(`/accecpt_payment/${order_id}`);
});


router.get('/accecpt_payment/:id', async function (req, res) {
    var id = req.params.id;
    var sql = `SELECT * FROM order_products WHERE order_id = '${id}'`
    var result = await exe(sql)
    res.render('user/accept_payment.ejs', { result })
})

router.post('/payment_success/:id', async function (req, res) {

    var id = req.params.id;
    var sql = `UPDATE orders SET payment_status = 'paid',transaction_id ='${req.body.razorpay_payment_id}' WHERE order_id = '${id}'`
    var result = await exe(sql)
    // res.send(result)
    res.redirect(`/my_orders`)
})
router.get('/my_orders', checkLogin, async function (req, res) {
    var id = req.params.id;
    var sql = `SELECT * FROM orders WHERE  customer_id = '${req.session.user_id}'`
    var result = await exe(sql)
    res.render('user/my_order.ejs', { result })
})
router.get('/print_invoice/:id', checkLogin, async function (req, res) {
    var id = req.params.id;
    var sql = `SELECT * FROM orders WHERE order_id = '${id}'`
    var order = await exe(sql) 
    var sql2 = `SELECT * FROM order_products WHERE order_id = '${id}'`
    var products = await exe(sql2)
    console.log("products" , products, order)
    res.render('user/print_invoice.ejs', { order,products })
})

router.get("/add_to_cart/:id", async function (req, res) {

    var product_id = req.params.id;
    var url_data = url.parse(req.url, true).query;
    var qty = url_data.qty;
    var size = url_data.size;

    if (req.session.user_id) {

        var customer_id = req.session.user_id;
        var sql = `SELECT * FROM carts WHERE customer_id = ? AND product_id = ? AND size = ?`;
        var info = await exe(sql, [customer_id, product_id, size]);

        if (info.length > 0) {
            console.log("Already in cart");
        } else {
            var sql = `INSERT INTO carts (customer_id, product_id, qty, size) VALUES (?, ?, ?, ?)`;
            var result = await exe(sql, [customer_id, product_id, qty, size]);
        }

        res.redirect(`/details/${product_id}`);
    } else {
        var cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        var obj = {
            product_id: product_id,
            qty: url_data.qty,
            size: url_data.size
        };
        var already = false;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].product_id == product_id && cart[i].size == url_data.size) {
                already = true;
                break;
            }
        }

        if (!already) {
            cart.push(obj);
        }
        res.cookie("cart", JSON.stringify(cart), { maxAge: 3600000 });
        res.redirect('/cart');
    }

});

router.get('/cart', async function (req, res) {
    var carts = [];

    if (req.session.user_id) {
        const customer_id = req.session.user_id;
        const sql = `SELECT * FROM carts WHERE customer_id = ?`;
        carts = await exe(sql, [customer_id]);
    } else {
        if (req.cookies.cart) {
            try {
                carts = JSON.parse(req.cookies.cart);  // ✅ JSON.parse added
            } catch (err) {
                console.error("❌ Error parsing cart cookie:", err);
                carts = [];
            }
        } else {
            carts = [];
        }
    }

    var cart_data = [];
    for (var i = 0; i < carts.length; i++) {
        var result = await exe(`SELECT * FROM products WHERE product_id = ?`, [carts[i].product_id]);
        if (result.length > 0) {
            const obj = {
                cart_id: (carts[i].cart_id) ? carts[i].cart_id : i,
                product_name: result[0].product_name,
                product_image: result[0].product_main_image,
                product_price: result[0].product_price,
                product_discount: result[0].apply_discount_percent,
                qty: carts[i].qty,
                size: carts[i].size,
            };
            cart_data.push(obj);
        } else {
            console.log(`⚠️ Product not found for ID: ${carts[i].product_id}`);
        }
    }

    const is_login = req.session.user_id ? true : false;
    res.render('user/add_to_cart.ejs', {
        result: cart_data,
        is_login
    });
});

router.get('/delete_cart/:id', function (req, res) {
    const id = req.params.id;
    console.log("Deleting cart item with ID:", id);

    if (req.session.user_id) {
        var customer_id = req.session.user_id;
        var sql = `DELETE FROM carts WHERE cart_id = ? AND customer_id = ?`;
        console.log(sql)
        exe(sql, [id, customer_id]);
        res.redirect("/cart");  // Or any page you want

    } else {
        let carts = JSON.parse(req.cookies.cart || '[]');
        let id = parseInt(req.params.id);
        if (!isNaN(id)) carts.splice(id, 1);
        res.cookie("cart", JSON.stringify(carts), { path: "/" });
        res.redirect("/cart");  // Or any page you want

    }


});

router.post('/place_order',checkLogin,async function(req,res){
    var d = req.body;
    var customer_id = req.session.user_id;
    var fullname = d.fullname;
    var mobile = d.mobile;
    var country = d.country;
    var state = d.state;
    var city = d.city;
    var area = d.area;
    var address = d.address;    
    var pincode = d.pincode;
    var payment_mode = d.payment_mode;

    var sql = `SELECT SUM(qty*product_price) as total_amount FROM carts,products WHERE carts.product_id = products.product_id `;
    var user_cart =await exe(sql);

    var total_amount = user_cart[0].total_amount;
    var order_date = new Date().toISOString().slice(0, 10); 
    var payment_status = "pending";
    var order_status = "placed";

    var sql2 = `INSERT INTO orders (customer_id, fullname, mobile, country, state, city, area, address, pincode, total_amount, payment_method, payment_status, order_date, order_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    var result = await exe(sql2,[customer_id,fullname,mobile,country,state,city,area,address,pincode,total_amount,payment_mode,payment_status,order_date,order_status])

    var order_id = result.insertId;

    var sql3 = `SELECT * FROM carts,products WHERE carts.product_id = products.product_id `
    var data = await exe(sql3)

    for(var i=0;i<data.length;i++){
        var product_id = data[i].product_id;
        var product_name = data[i].product_name;
        var product_size = data[i].size;
        var product_market_price = data[i].product_market_price;
        var product_discount = data[i].apply_discount_percent;
        var product_price = data[i].product_price;
        var product_qty = data[i].qty;
        var product_total = product_qty * product_price;
        
        var sql4 = `INSERT INTO order_products (order_id, customer_id, fullname, mobile, product_id, product_name, product_size, product_market_price, product_discount, product_price, product_qty, product_total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
        var result2 = await exe(sql4,[order_id,customer_id,fullname,mobile,product_id,product_name,product_size,product_market_price,product_discount,product_price,product_qty,product_total])
        

    }
    var sql5 = `DELETE FROM carts WHERE customer_id = ?`
    var result3 = await exe(sql5,[customer_id])
    res.redirect(`/accecpt_payment/${order_id}`);
})

router.get('/profile', checkLogin, async function (req, res) {
    var id = req.session.user_id;
    var sql = `SELECT * FROM customers WHERE customer_id = '${id}'`

    var result = await exe(sql)
    console.log(result)
    res.render('user/profile.ejs', { result })
})
router.get('/logout', function (req, res) {
    req.session.destroy();
    res.clearCookie("cart");
    res.redirect('/');
})


module.exports = router