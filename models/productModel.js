const mongoose = require('mongoose');

const Product = new mongoose.Schema({
  
  name: { type: String, required: true },

  description: { type: String, required: true },

  image:[{ type:String, required:true }],

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category',required: true },

  price:{ type:Number, required:true },

  discountPrice: { type: Number },
 

  

  // discount_price:{ type:Number },

  quantity:{ type: Number, required : true },

  productAddDate: { type: Date, default: Date.now },
  
  is_listed:{ type:Boolean, default:true },

  discountStatus:{type:Boolean, default:false },

  discount:Number,

  discountStart:Date,
  
  discountEnd:Date,
 
});

module.exports = mongoose.model('Product', Product);


