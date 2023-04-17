const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// password 1231331
const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body;
            const user = await Users.findOne({email});
            console.log({name, email, password});
            // logic store data
            if(user) {
                return res.status(400).json({msg: "Người dùng đã tồn tại."})
            }

            if(!name){
                return res.status(400).json({msg: "Hãy điền tên."});
            }

            if(!email){
                return res.status(400).json({msg: "Hãy điền Email."});
            }

            if(password.length < 6) {
                return res.status(400).json({msg: "Mật khẩu phải hơn 6 ký tự."});
            }

            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = new Users({
                name, email, password:passwordHash,
            });

            // Save user to mongoose database
            await newUser.save();

            //  then create jsonwebtoken to authentication
            const accessToken = createAccessToken({id: newUser._id});
            const refreshToken = createRefreshToken({id: newUser._id});

            // store token to cookie 
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            });
            
            console.log({accessToken});

            res.json({accessToken});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    login: async (req, res) => {
        try{
            const {email, password} = req.body;
            
            const user = await Users.findOne({email});    
            if(!user) {
                return res.status(400).json({msg: "User is not exist."})
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) {
                return res.status(400).json({msg: "Incorrect Password."})
            }

            // if Login success, create access_token and refresh_token
                //  then create jsonwebtoken to authentication
             const accessToken = createAccessToken({id: user._id});
             const refreshToken = createRefreshToken({id: user._id});
 
                // store token to cookie 
             res.cookie('refreshToken', refreshToken, {
                 httpOnly: true,
                 path: '/user/refresh_token'
             });
            res.json({accessToken});
        }catch (err){
            return res.status(500).json({msg: err.message});
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshToken', {path: '/user/refresh_token'});
            return res.json({msg: 'logout success.'});
        }catch (err){
            return res.status(500).json({msg: err.message});
        }
    },
    refreshToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken;
            if(!rf_token) {
                return res.status(400).json({msg: "please Login or Register"});
            } 
                   
            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                // throw err when token wrong
                if(err) {return res.status(400).json({msg: "please Login or Register"});}
                
                const accessToken = createAccessToken({id: user.id});
                
                // check user
                res.json({ accessToken });
            });
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    getUser: async (req, res) => {
        try{
            const token = req.body.token;
            if(!token) {
                return res.status(400).json({msg: "please Login or Register"});
            } 
            const id = jwt.verify(token, 'IqJ2xwfJ57sV^y3e');
            const user = await Users.findById(id.id).select('-password');
            if(!user) return res.status(400).json({msg: 'User not found'});
            return res.json(user);
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    addCart: async (req, res) => {
        try {
            const { userId, quantity, product } = req.body;
            const userDB = await Users.findById(userId);
            const cart = userDB.cart;
    
            // Check if product already exists in cart
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].item.product_id === product.product_id) {
                    return res.status(400).json({ msg: "Sản phẩm đã tồn tại !" });
                }
            }
    
            // Add product and quantity to user's cart
            userDB.cart.push({
                item: product,
                number: quantity
            });
    
            // Check if quantity is greater than zero
            if (quantity <= 0) {
                return res.status(400).json({ msg: "Số lượng không được bằng không !" });
            }
    
            // Update user's cart in database
            await Users.findOneAndUpdate({ _id: userId }, { cart: userDB.cart });
    
            // Return success response with updated user data
            return res.json({ msg: "Sản phẩm đã được thêm thành công!" });
        } catch (err) {
            // Return error response with error message
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteItem: async (req, res) => {
        try {
            const { userId, productId } = req.body;
            const userDB = await Users.findById(userId);
            const cart = userDB.cart;
    
            
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].item.product_id === productId) {
                    cart.splice(i, 1);
                }
            }
            
            // // Update user's cart in database
            await Users.findOneAndUpdate({ _id: userId }, { cart: cart });
    
            // Return success response with updated user data
            return res.json(cart);
        } catch (err) {
            // Return error response with error message
            return res.status(500).json({ msg: err.message });
        }
    },
    deleteAllItem: async (req, res) => {
        try {
            const { userId } = req.body;
            const userDB = await Users.findById(userId);
            const cart = userDB.cart;

            if(cart.length === 0) {
                return res.status(400).json({ msg: "Không có sản phẩm để thanh toán" });
            }
            // // Update user's cart in database
            await Users.findOneAndUpdate({ _id: userId }, { cart: [] });
    
            // Return success response with updated user data
            return res.json([]);
        } catch (err) {
            // Return error response with error message
            return res.status(500).json({ msg: err.message });
        }
    }
}

const createAccessToken = (user) => {
    return jwt.sign(user, "IqJ2xwfJ57sV^y3e", {expiresIn: '2 days'});
}
const createRefreshToken = (user) => {
    return jwt.sign(user, "IqJ2xwfJ57sV^y3e", {expiresIn: '4 days'});
}

module.exports = userCtrl;