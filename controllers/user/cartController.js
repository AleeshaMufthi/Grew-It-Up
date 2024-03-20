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
      return res.redirect('/login');
    }

    const userCart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!userCart) {
      return res.render("user/cart", { userData, cart: null });
    }

    const cart = userCart.items;
    const subtotal = calculateSubtotal(cart);
    const productTotal = calculateProductTotal(cart);

    const productPromises = cart.map(async (cartItem) => {
      const product = await Product.findById(cartItem.product._id);
      return { productId: cartItem.product._id, availableStock: product.quantity };
    });
    const products = await Promise.all(productPromises);
    
    const outOfStockError = cart.some(cartItem => {
      const product = products.find(prod => prod.productId.toString() === cartItem.product._id.toString());
      return product.availableStock < cartItem.quantity;
    });

    const maxQuantityErr = cart.some(cartItem => cartItem.quantity > 2);

    const subtotalWithShipping = subtotal;

    res.render("user/cart", { 
      userData,
      productTotal,
      subtotalWithShipping,
      outOfStockError,
      maxQuantityErr,
      cart,
      products
    });
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
    const userId = req.session.user_id;
    const productId = req.query.productId;
    const newQuantity = parseInt(req.query.quantity);

    const existingCart = await Cart.findOne({ user: userId })

    if (existingCart) {
      const existingCartItem = existingCart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingCartItem) {
        existingCartItem.quantity = newQuantity;
        existingCart.total = existingCart.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );

        

        // Fetch updated subtotal and product total
        const subtotalWithShipping = calculateSubtotal(existingCart.items);
        const productTotal = calculateProductTotal(existingCart.items);

        // Send the updated subtotal and product total along with success status
        res.json({ success: true, subtotalWithShipping, productTotal });

        await existingCart.save();
      } else {
        res.json({ success: false, error: "Product not found in cart" });
      }
    } else {
      res.json({ success: false, error: "Cart not found" });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.json({ success: false, error: "Internal server error" });
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
    removeFromCart,

}