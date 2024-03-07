const Cart = require('../../models/cartModel')
const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const {calculateProductTotal, calculateSubtotal} = require('../../config/cartSum')

// LOAD CART
const loadCartPage = async (req, res) => {
  try {
      const userId = req.session.user_id;
      
      const userData = await User.findById(userId);

      if (!userData) {
        // Redirect to login page if user not found
        return res.redirect('/login');
      }
      
      if (userData) {

          const userCart = await Cart.findOne({ user: userId }).populate("items.product");
          
          if (userCart) {
             

              const cart = userCart ? userCart.items : [];


              const subtotal = calculateSubtotal(cart);
        
              const productTotal = calculateProductTotal(cart);

              const subtotalWithShipping = subtotal;
              
              let outOfStockError = false;
          
              if (cart.length > 0) {
                for (const cartItem of cart) {
                  const product = cartItem.product;
          
                  if (product.quantity < cartItem.quantity) {
                    outOfStockError = true;
                    break;
                  }
                }
              }
              let maxQuantityErr = false;
              if (cart.length > 0) {
                for (const cartItem of cart) {
                  const product = cartItem.product;
          
                  if (cartItem.quantity > 2) {
                    maxQuantityErr = true;
                    break;
                  }
                }
              }
          
              res.render("user/cart", { userData,
                productTotal,
                subtotalWithShipping,
                outOfStockError,
                maxQuantityErr,
                cart });
          } else {
              // Handle scenario where user has no cart
              res.render("user/cart", { userData, cart: null });
          }
      } else {
          res.redirect('/login');
      }
  } catch (error) {
      console.error("Error loading cart:", error);
      res.status(500).send("Error loading cart");
  }
}

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const product_Id = req.body.productData_id;

    const { qty } = req.body;

    const existingCart = await Cart.findOne({ user: userId });
   
    let newCart = {};
    if (existingCart) {
      const existingCartItem = existingCart.items.find(
        (item) => item.product.toString() === product_Id
      );

      if (existingCartItem) {
        existingCartItem.quantity += parseInt(qty);
      } else {
        existingCart.items.push({
          product: product_Id,
          quantity: parseInt(qty),
        });
      }

      existingCart.total = existingCart.items.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );

      await existingCart.save();
    }    else {
  
      newCart = new Cart({
        user: userId,
        items: [{ product: product_Id, quantity: parseInt(qty) }],
        total: parseInt(qty, 10),
      });
 
      await newCart.save();
    }
    res.redirect('/cart')
  
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
};


  // UPDATE CART COUNT 
  const updateCartCount = async (req, res) => {
    try {
      const {userId} = req.body;
      const { quantity ,productId} =req.body;
      const existingCart = await Cart.findOne({ user: userId }).populate("items.product");
  
      if (!existingCart) {
        return res.status(400).json({ success: false, error: 'Cart not found' });
      }
  
      const existingCartItem = existingCart.items.find(
        (item) => item.product._id.toString() == productId
      );
      if (!existingCartItem) {
        return res.status(400).json({ success: false, error: 'Product not found in the cart' });
      }
  
      const productToUpdate = await Product.findById(productId);
  
      if (!productToUpdate) {
        return res.status(400).json({ success: false, error: 'Product not found' });
      }
  console.log(quantity);
      existingCartItem.quantity = parseInt(quantity);
      
      existingCart.total = existingCart.items.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );
  
      await existingCart.save();
      return res.status(200).json({ success: true, message: 'Cart updated successfully' });
  
    } catch (error) {
      console.error("Error updating cart:", error);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  };
  

// REMOVE FROM CART 
const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;

    const existingCart = await Cart.findOne({ user: userId });
    if (existingCart) {
      const updatedItems = existingCart.items.filter(
        (item) => item.product.toString() !== productId
      );

      existingCart.items = updatedItems;
      existingCart.total = updatedItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );

      await existingCart.save();

      res.json({ success: true ,toaster:true});
    } else {
      res.json({ success: false, error: "Cart not found" });
    }
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.json({ success: false, error: "Internal server error" });
  }
};
  
module.exports={
    loadCartPage,
    addToCart,
    updateCartCount,
    removeFromCart
}