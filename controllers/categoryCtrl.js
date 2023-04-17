const Category = require("../models/categoryModel");

const categoryCtrl = {
    getCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.json(categories);
        }catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    createCategory: async (req, res) => {
        try {
            // admin is user have role = 1
            // only admin can create, delete and update 
            const {name} = req.body;
            const category = await Category.findOne({name});
            if(category) {return res.status(400).json({msg: "this category already exits."})} 

            const NewCategory = new Category({name})

            await NewCategory.save()
            res.json({msg:"create category"});

        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    deleteCategory: async (req, res) => {
        try {
            await Category.findByIdAndDelete(req.params.id);
            res.json({msg: "Delete Success"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    updateCategory:async (req, res) => {
        try {
            const {name} = req.body;
            await Category.findByIdAndUpdate({_id: req.params.id}, {name});

            res.json({msg: "Update success"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    }
}

module.exports = categoryCtrl;