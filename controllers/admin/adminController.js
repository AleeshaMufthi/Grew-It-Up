const bcrypt = require("bcryptjs");
const User = require('../../models/userModel');
const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const {
  getMonthlyDataArray,
  getDailyDataArray,
  getYearlyDataArray,
} = require('../../config/chartData')

// ADMIN LOGIN
const loadAdminLogin = async (req, res) => {
  try {
    res.render("admin/login");
  } catch (error) {
    console.log(error.message);
 
  }
};

// VERIFY LOGIN
const verifyLogin = async (req, res) => {

  try {
    const { email, password } = req.body;

    const adminData = await User.findOne({ email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch && adminData.isAdmin === 1) {
    
        req.session.admin_id = adminData._id;

        res.redirect("/admin/home");
      } else {
        res.render("admin/login", {
          message: "Email & password are incorrect",
        });
      }
    } else {
      res.render("admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ADMIN HOME
const loadHome = async (req, res) => {
  try {
    let query = {};
    const adminData = await User.findById(req.session.admin_id);
    const totalRevenue = await Order.aggregate([
      { $match: {    "items.status": "Delivered"  } }, // Include the conditions directly
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
    ]);

     // New code to fetch top selling products and categories
     const topProducts = await getTopSellingProducts();
     const topCategories = await getTopSellingCategories();

    const totalUsers = await User.countDocuments({ is_blocked: 1});
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const orders = await Order.find().populate("user").limit(10).sort({ orderDate: -1 });

    const monthlyEarnings = await Order.aggregate([
      {
        $match: {
          "items.status": "Delivered" ,
          orderDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      { $group: { _id: null, monthlyAmount: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenueValue = totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0;
    const monthlyEarningsValue = monthlyEarnings.length > 0 ? monthlyEarnings[0].monthlyAmount : 0;

    const newUsers = await User.find({ is_blocked: 1, isAdmin:0 })
      .sort({ date: -1 })
      .limit(5);

      // Get monthly data
      const monthlyDataArray = await getMonthlyDataArray();

      // Get daily data
      const dailyDataArray = await getDailyDataArray();
    
      // Get yearly data
      const yearlyDataArray = await getYearlyDataArray();

    const monthlyOrderCounts= monthlyDataArray.map((item) => item.count)
  
    const dailyOrderCounts= dailyDataArray.map((item) => item.count)

    const yearlyOrderCounts= yearlyDataArray.map((item) => item.count)

    res.render("admin/adminHome", {
      admin: adminData,
      totalRevenue:totalRevenueValue,
      totalOrders,
      totalCategories,
      totalProducts,
      totalUsers,
      newUsers,
      orders,
      monthlyEarningsValue,
      monthlyOrderCounts,
      dailyOrderCounts,
      yearlyOrderCounts,
      topProducts,// Pass top selling products to the view
      topCategories, // Pass top selling categories to the view
    });
  } catch (error) {
    console.log(error.message);
    // Handle errors appropriately
  }
};

// Function to fetch top selling products
const getTopSellingProducts = async () => {
  try {
    const orders = await Order.find({ "items.status": "Delivered"}).populate({ path: "items.product" });
    const productSales = {};

    // Calculate total sales for each product
    orders.forEach(order => {
      order.items.forEach(item => {
        if (productSales[item.product._id]) {
          productSales[item.product._id] += item.quantity;
        } else {
          productSales[item.product._id] = item.quantity;
        }
      });
    });

    // Sort products by sales and get top 10
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Fetch product details for top products
    const topProductsDetails = await Product.find({ _id: { $in: topProducts.map(([productId]) => productId) } });

    return topProductsDetails.map(product => ({
      id: product._id,
      name: product.name,
      sales: productSales[product._id],
    }));
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

// Function to fetch top selling categories
const getTopSellingCategories = async () => {
  try {
    const orders = await Order.find({ "items.status": "Delivered"}).populate({ path: "items.product" });
    const categorySales = {};

    // Calculate total sales for each category
    orders.forEach(order => {
      order.items.forEach(item => {
        const categoryId = item.product.category;
        console.log(categoryId);
        if (categoryId) { // Check if categoryId is defined
        if (categorySales[categoryId]) {
          categorySales[categoryId] += item.quantity;
        } else {
          categorySales[categoryId] = item.quantity;
        }
      }
      });
    });

    // Sort categories by sales and get top 10
    const topCategories = Object.entries(categorySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Fetch category details for top categories
    const topCategoriesDetails = await Category.find({ _id: { $in: topCategories.map(([categoryId]) => categoryId) } });

    return topCategoriesDetails.map(category => ({
      id: category._id,
      name: category.name,
      sales: categorySales[category._id],
    }));
  } catch (error) {
    console.error(error.message);
    return [];
  }
};


// LOAD USER PAGE
const loadUserpage= async(req, res)=>{
  try {
    const adminData = await User.findById(req.session.admin_id);

    const usersData = await User.find({
      isAdmin:0
    });

    res.render('admin/userDashboard', { users: usersData, admin: adminData });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error: " + error.message);
  }
};

// BLOCK USER
const listUser = async (req, res) => {
try {
      const id = req.query.id;
      const Uservalue = await User.findById(id);
      
      if (Uservalue.is_blocked) {
        const UserData = await User.updateOne(
          {_id:id},
          {
            $set: {
              is_blocked: 0
            },
          }
        );
        if (req.session.user_id) delete req.session.user_id;
      }else{
      
        const UserData = await User.updateOne(
          {_id:id},
          {
            $set: {
              is_blocked: 1
            },
          }
        );
      }
      
      res.redirect("/admin/userData");
    } catch (error) {
      console.log(error.message);
    }
  

};


// ADMIN LOGOUT
const adminLogout = async (req, res) => {
  try {
    delete req.session.admin_id;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  
  }
};

module.exports = {
  loadAdminLogin,
  verifyLogin,
  loadHome,
  adminLogout,
  loadUserpage,
  listUser,
};
