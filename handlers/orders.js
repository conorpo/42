const OrderModel = require('../models/Order.js');
const fs = require('fs');

const orderHandler = (req, res, next) => {
    const body = req.body.order || req.body;
    const topic = req.header('x-shopify-topic');
    req.webhookType="update";
    if(topic === 'orders/create'){

        //Creates a new order

        const items = [];
        body.line_items.forEach(item => {
            if(item.discount_allocations.length == 0){
                item.discount_allocations.push({amount: '0'});
            }
            items.push({
                title: item.title,
                variant_title: item.variant_title,
                basePrice:  item.price,
                discount: parseFloat(item.total_discount)+parseFloat(item.discount_allocations[0].amount),
                quantity: item.quantity
            })
        });
        const order = new OrderModel({
            _id: body.id,
            email: body.email,
            subtotal_price: body.subtotal_price,
            shipping_price: body.total_shipping_price_set.shop_money.amount,
            total_discount: body.total_discounts, 
            f_name: body.shipping_address.first_name,
            l_name: body.shipping_address.last_name,
            address: body.shipping_address.address1,
            country: body.shipping_address.country,
            province: body.shipping_address.province,
            city: body.shipping_address.city,
            zip: body.shipping_address.zip,
            phone: body.shipping_address.phone,
            customer_id: String(body.customer.id),
            created_at: new Date(body.created_at),
            updated_at: new Date(body.updated_at),
            closed_at: null,
            cancelled_at: null,
            shipping_type: body.shipping_lines[0].title,
            shipping_id: body.shipping_lines[0].id,
            line_items: items
        });
        order.save().then(doc => {
            console.log(`Order ${doc._id} created.`);
            req.order = doc;
            req.webhookType = "new";
            res.status(200).send(doc);
            next();
        }).catch(err => {
            res.status(400).send(err);
            return fs.appendFile('./public/log.txt',`\n${(new Date())} --- ${err}\n`, () => {}) //logs out errors at site/log.txt
        })
    } else if(topic === 'orders/updated'){

        //Overwrites entire order doc with new data

        OrderModel.findById(body.id).then(doc => {
            const items = [];
            body.line_items.forEach(item => {
                if(item.discount_allocations.length == 0){
                    item.discount_allocations.push({amount: '0'});
                }
                items.push({
                    title: item.title,
                    variant_title: item.variant_title,
                    basePrice:  item.price,
                    discount: parseFloat(item.total_discount)+parseFloat(item.discount_allocations[0].amount),
                    quantity: item.quantity
                })
            });
            doc.overwrite({
                _id: body.id,
                email: body.email,
                subtotal_price: body.subtotal_price,
                shipping_price: body.total_shipping_price_set.shop_money.amount,
                total_discount: body.total_discounts, 
                f_name: body.shipping_address.first_name,
                l_name: body.shipping_address.last_name,
                address: body.shipping_address.address1,
                country: body.shipping_address.country,
                province: body.shipping_address.province,
                city: body.shipping_address.city,
                zip: body.shipping_address.zip,
                phone: body.shipping_address.phone,
                customer_id: String(body.customer.id),
                created_at: new Date(body.created_at),
                updated_at: new Date(body.updated_at),
                closed_at: (body.closed_at) ? new Date(body.closed_at) : null,
                cancelled_at: (body.cancelled_at) ? new Date(body.cancelled_at) : null,
                line_items: items
            });
            return doc.save();
        }).then(doc => {
            console.log(`Order ${doc._id} updated.`);
            req.order = doc;
            res.status(200).send(doc);
            next();
        }).catch(err => {
            res.status(400).send(err);
            return fs.appendFile('./public/log.txt',`\n${(new Date())} --- ${err}\n`, () => {}) //logs out errors at site/log.txt
        })
    } else if(topic === 'orders/fulfilled'|| topic === 'orders/cancelled') {

        //updates the dates on the doc

        OrderModel.findById(body.id).then(doc => {
            if(topic === 'orders/fulfilled') doc.closed_at = Date(body.closed_at);
            if(topic === 'orders/cancelled') doc.cancelled_at = Date(body.cancelled_at);
            doc.updated_at = Date(body.updated_at);
            return doc.save();
        }).then(doc => {
            console.log(`Order ${doc._id} ${topic.slice(7)}.`);
            req.order = doc;
            res.status(200).send(doc);
            next();
        }).catch(err => {
            res.status(400).send(err);
            return fs.appendFile('./public/log.txt',`\n${(new Date())} --- ${err}\n`, () => {}) //logs out errors at site/log.txt
        })
    } else if(topic === 'orders/delete'){

        //Deletes a doc
        OrderModel.findOneAndDelete({_id: body.id}).then(doc => {
            console.log(`Order ${doc._id} deleted.`);
            req.order = doc;
            req.webhookType = "delete";
            res.status(200).send(doc);
            next();
        }).catch(err => {
            res.status(400).send(err);
            return fs.appendFile('./public/log.txt',`\n${(new Date())} --- ${err}\n`, () => {}) //logs out errors at site/log.txt
        })

    }
}

module.exports = orderHandler;