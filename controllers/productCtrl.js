 const Products = require('../models/productModel');

// Filtering, sorting and paginating
const productCtrl = {
    getProducts: async (req, res,) => {
        try {
            const { page = 1, limit = 6, search, filter } = req.query;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;


            let query = search
            ? { title: { $regex: search, $options: "i" } }
            : {};

            if(filter){
                query = filter
                ? { content: { $regex: filter, $options: "i" } }
                : {};
            }

            const products = await Products.find(query).skip(startIndex).limit(limit);
            
            console.log(products)

            const count = await Products.countDocuments(query);
            
            const result = {
                products,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
                totalCount: count
              };

            res.json(result);
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    createProduct: async (req, res,) => {
        try {
            const {product_id, title, price, description, content, images, category} = req.body; 
            //check images 
            if(!images) {
                return res.status(400).json({msg: "No image upload"});
            };
            
            // check product in category
            const product = await Products.findOne({product_id});
            if(product) {
                return res.status(400).json({msg: "This product already exists"});
            };
            //create a new product
            const newProduct = new Products({
                product_id, title: title.toLowerCase(), price, description, content, images, category
            });

            await newProduct.save();
            res.json({message: "created a new Product"});

        } catch (err) {
            return res.status(500).json({msg: err.message});   
        }
    },
    deleteProduct: async (req, res,) => {
        try {
            await Products.findByIdandDelete(req.params.id);
            res.json({message: "delete product"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    updateProduct: async (req, res,) => {
        try {
            const {title, price, description, content, images, category} = req.body; 
            if(!images) {
                return res.status(400).json({msg: "No image upload"});
            }

            await Products.findOneAndUpdate({_id: req.params.id},{
                title: title.toLowerCase(), price, description, content, images, category
            })

            res.json({message: "Update success"})
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    Quality: async (req, res,) => {
        const features = new APIfeatures(Products.find(), req.query).filtering().sorting().paginating()
        // get all products
        const products = await features.query;
        return res.json(products.length);
    },
    getDetailProduct: async (req, res,) => {
        const product = await Products.find({product_id: req.params.id})
        // get all products
        return res.json({product});
    },
    
 }

 module.exports = productCtrl;