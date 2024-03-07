const bcrypt = require ('bcrypt'); //Hashing passwords
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const message = require ('../../config/mailer');
const Wallet = require('../../models/walletModel');

// PASSWORD HASH
const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    }catch(error){
        console.log(error.message);
    }
}

//GET REGISTER
const loadRegister = async(req,res)=>{
    try{ 
        referral = req.query.referralCode;
        res.render('user/register',referral)
    }catch(error){
        console.log(error.message);
    }
}

//POST REGISTER
const insertUser = async (req, res) => {
  try {
      const email = req.body.email;
      const mobile = req.body.mobile;
      const name = req.body.name;
      const password = req.body.password;
      if (!email || !mobile || !name || !password) {
          return res.render("user/register", {
              message: "Please fill this fields out",
          });
      }

      req.session.referralCode = req.body.referralCode || null;
      const referralCode = req.session.referralCode;

      const existMail = await User.findOne({ email: email });

      if (referralCode) {
          referrer = await User.findOne({ referralCode: referralCode });
          console.log(referrer, "referrer");

          if (!referrer) {
              res.render("user/register", { message: "Invalid referral code." });
          }
      }

      if (existMail) {
          res.render("user/register", { message: "This user already exists" });
      } else {
          req.session.userData = req.body;
          req.session.registerOtpVerify = 1;
          req.session.email = email;
          if (req.session.email) {
              const data = await message.sendVarifyMail(req, req.session.email);
              res.redirect("/otp");
          }
      }
  } catch (error) {
      console.log(error.message);
  }
};

//GET OTP 
const loadOtp = async(req,res)=>{
  try{
    res.render('user/otp')
  }catch(error){
    console.log(error.message);
  }
}


//VERIFY OTP
const verifyOtp = async (req, res) => {
  try {
    const userData = req.session.userData;
    const firstDigit = req.body.first;
    const secondDigit = req.body.second;
    const thirdDigit = req.body.third;
    const fourthDigit = req.body.fourth;
    const fullOTP = firstDigit + secondDigit + thirdDigit + fourthDigit;

    if (!req.session.user_id) {
      if (fullOTP == req.session.otp) {
        const secure_password = await securePassword(userData.password);
        const user = new User({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          password: secure_password,
          image:'',
          isAdmin: 0,
          is_blocked: 1,
        });

        const userDataSave = await user.save();
        if (userDataSave && userDataSave.isAdmin === 0) {
          req.session.user_id = userDataSave._id;
          res.redirect("/");
        } else {
          res.render("user/otp", { message: "Registration Failed" });
        }
      } else {
        res.render("user/otp", { message: "Invalid otp" });
      }
    } else {
      if (fullOTP == req.session.otp) {
        res.redirect("/resetPassword");
      } else {
        res.render("user/otp", { message: "Invalid otp" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//RESEND OTP
const resendOTP = async (req, res) => {
  try {
    // Retrieve user data from session storage
    const userData = req.session.userData;

    if (!userData) {
      res.status(400).json({ message: "Invalid or expired session" });
    } else {
      delete req.session.otp;
      const data = await message.sendVarifyMail(req, userData.email);
    }

    // Generate and send new OTP using Twilio

    res.render("user/otp", { message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error: ", error);
    res.render("user/otp", { message: "Failed to send otp" });
  }
};

// GET LOGIN
const loadLogin = async (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
  }
};

// POST LOGIN
const verifyLogin = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.render("user/login", {
              message: "Please fill all the fields out",
          });
      }

      const userData = await User.findOne({ email: email });

      if (userData) {
          if (userData.is_blocked === 0) {
              // If the user is blocked, show an error message
              return res.render("user/login", {
                  message: "You are blocked. Contact the admin for more information.",
              });
          }

          const passwordMatch = await bcrypt.compare(password, userData.password);

          if (passwordMatch && userData.isAdmin === 0) {
              // If the credentials are correct and the user is not an admin, redirect to the home page
              req.session.user_id = userData._id;
              req.session.isLogged=true
              return res.redirect("/");
          }
      }

      // If email or password is incorrect, or the user is an admin, show an error message
      res.render("user/login", {
          message: "Invalid Email or Password",
      });
  } catch (error) {
      console.error(error.message);
      res.status(500).render("user/login", {
          message: "Internal Server Error",
      });
  }
};




// GET FORGOT PASSWORD
const loadForgetpassword = async (req, res) => {
  try {
    res.render("user/forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};

// FORGOT PASSWORD OTP
const forgotPasswordOTP = async (req, res) => {
  try {
    const emaildata = req.body.email;
    console.log("Email received:", emaildata);

    const userExist = await User.findOne({ email: emaildata });
    req.session.userData=userExist;
    req.session.user_id = userExist._id;
    if (userExist) {
      const data = await message.sendVarifyMail(req, userExist.email);
      return res.redirect("/otp");
    } else {
    
      res.render("user/forgotPassword", {
        error: "Attempt Failed",
        User: null,
      });
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
};

// GET RESET PASSWORD
const loadResetPassword = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userId = req.session.user_id;
      console.log(userId, "userId");
      const user = await User.findById(userId);

      res.render("user/resetPassword", { User: user });
    } else {
      res.redirect("/forgotPassword");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// POST RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const password = req.body.password;
    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password } }
    );
    if (updatedData) {
      res.redirect("/userprofile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD HOME
const loadHome = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);

    const productData = await Product.find();

    const categories = await Category.find();
  
    if (userData) {
      res.render("user/home", { userData, products: productData, categories});
    } else {
      res.render("user/home", { userData: null, products: productData, categories });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD SHOP
const loadShop = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);

    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    const perPage = 9; // Number of products per page

    const totalProducts = await Product.countDocuments({ is_listed: true });
    const totalPages = Math.ceil(totalProducts / perPage);

    const paginatedProductData = await Product.find({ is_listed: true })
      .skip((page - 1) * perPage)
      .limit(perPage);
      const categories = await Category.find();
  

    res.render('user/shop', {
      products: paginatedProductData,
      userData,
      categories, categories,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

// SHOP CATEGORY
// const loadShopCategory = async (req, res) => {
//   try {
//     const userId = req.session.user_id;
//     const userData = await User.findById(userId);
//     const categoryId = req.query.id;
//     const productData = await Product.find({category:categoryId});
//     const categories = await Category.find();
//     res.render("user/shop", { products: productData, userData, categories });
//   } catch (error) {
//     console.log(error.message);
//   }
// };
const loadShopCategory = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const categoryId = req.query.id;

    // Pagination logic for the category
    const page = parseInt(req.query.page) || 1;
    const perPage = 9; // Number of products per page

    const totalProducts = await Product.countDocuments({ category: categoryId });
    const totalPages = Math.ceil(totalProducts / perPage);

    const paginatedProductData = await Product.find({ category: categoryId })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const categories = await Category.find();

    res.render("user/shop", {
      products: paginatedProductData,
      userData,
      categories,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};



// USER LOGOUT
const userLogout = async (req, res) => {
  try {
    req.session.isLogged=false
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD SINGLE SHOP
const loadSingleShop = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);

    if(!userData){
      return res.redirect('/login');
    }

    const productId = req.params.id;
    const product = await Product.findById(productId);

  if(!product){
    return res.status(404).send('Product not found');
  }

    const categories = await Category.find();

    if(!categories || categories.length===0){
      return res.status(404).send('Categories not found');
    }

    res.render("user/singleProduct", { userData, product, categories });
  } catch (error) {
    console.log(error.message);
    return res.status(404).render("layout/404Error", { userData: null });
  }
}

// LOAD USER PROFILE
const loadprofile = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    if (userData) {
      res.render("user/userProfile", { userData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// EDIT PROFILE
const userEdit = async (req, res) => {
  try {

    let id = req.body.user_id;

    const userData = await User.findById(id);

    const { name, mobile, email } = req.body;

    if(!req.file){
      const updateData = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            mobile,
            email,
       
          },
        }
      );
    }
    else{
      const updateData = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            mobile,
            email,
            image: req.file.filename,
          },
        }
      );
    }

    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD CONTACT PAGE
const loadContactPage = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
  
    if (userData) {
      res.render("user/contact", { userData });
    } else {
      res.render("user/contact", { userData: null });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD ABOUT US 
const loadAboutUs = async(req,res)=>{
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
  
    if (userData) {
      res.render("user/aboutUs", { userData });
    } else {
      res.render("user/aboutUs", { userData: null });
    }
  } catch (error) {
    console.log(error.message);
  }
}

// LOAD WALLET
const loadWallets = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
    if (!userData) {
      return res.render("user/login", { userData: null });
    }

    const walletData = await Wallet.findOne({ user: userId });

    if (!walletData) {
   
      return res.render("user/wallet", { userData, wallet: null });
    }

    res.render("user/wallet", { userData, wallet: walletData });
  } catch (err) {
  
    console.error("Error in loadWallets route:", err);
    res.status(500).send("Internal Server Error");
  }
};

  module.exports={
    loadRegister,
    insertUser,
    loadOtp,
    verifyOtp,
    resendOTP,
    loadLogin,
    verifyLogin,
    loadForgetpassword,
    forgotPasswordOTP,
    loadResetPassword,
    resetPassword,
    loadHome,
    loadShop,
    userLogout,
    loadShopCategory,
    loadSingleShop,
    loadprofile,
    userEdit,
    loadContactPage,
    loadAboutUs,
    loadWallets

  }