const Product = require('../../models/productModel')
const path = require('path')
const sharp = require('sharp')
const Category = require('../../models/categoryModel')
const User = require('../../models/userModel')
const multer = require('../../middleware/multer');
const { uploadProduct } = require('../../middleware/multer');

// LOAD PRODUCTS
const loadProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await Category.find();
    res.render("admin/products", { products, categories });
  } catch (error) {
    console.log(error.message);
  }
};

// LOAD PRODUCT FORM
const loadPorductForm = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id });
    let categories = await Category.find({});
    res.render("admin/addProduct", { categories, admin: userData, });
  } catch (error) {
    console.log(error.message);
  }
};
   
// ADD PRODUCT
const addProduct = async (req, res) => {
  try {
    const imageData = [];
    const imageFiles = req.files;

    for (const file of imageFiles) {

      const randomInteger = Math.floor(Math.random() * 20000001);
      const imageDirectory = path.join(
        "public",
        "assets",
        "imgs",
        "productIMG"
      );
      const imgFileName = "cropped" + randomInteger + ".jpg";
      const imagePath = path.join(imageDirectory, imgFileName);

      const croppedImage = await sharp(file.path)
        .resize(400, 400, {
          fit: "cover",
        })
        .toFile(imagePath);

      if (croppedImage) {
        imageData.push(imgFileName);
      }
    }

    const {
      name,
      category,
      price,
      quantity,
      description,
    } = req.body;

    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    let categories = await Category.find({});

    if (existingProduct) {
      res.render("admin/addProduct", {
        error: "Product with the same name already exists",
        product: existingProduct,
        categories,
      });
    }
    const addProducts = new Product({
      name,
      category,
      price,
      description,
      quantity,
      image: imageData,
    });

    await addProducts.save();
    res.redirect("/admin/products");
  } catch (error) {
console.log(error.message);
    res.status(500).send("Error while adding product");
  }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const Productvalue = await Product.findById(id);

    if (Productvalue.is_listed) {
      const productData = await Product.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            is_listed: false,
          },
        }
      );
    } else {
      const productData = await Product.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            is_listed: true,
          },
        }
      );
    }

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

// EDIT PRODUCT FORM
  const loadEditProductForm = async (req, res) => {
    try {
   const id = req.query.id;
      const product = await Product.findOne({ _id: id });
      let categories = await Category.find({});
      if (product) {
        res.render("admin/editProduct", { categories, product });
      } else {
        res.redirect("/admin/products");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

// STORE EDIT PRODUCT
const storeEditProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.body.product_id });
    let images = [], deleteData = [];

    const { name, category, price, description, quantity} = req.body;
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    let categories = await Category.find({});

    if (req.body.deletecheckbox) {
      deleteData.push(req.body.deletecheckbox);

      deleteData = deleteData.flat().map((x) => Number(x));

      images = product.image.filter((img, idx) => !deleteData.includes(idx));
    } else {
      images = product.image.map((img) => {
        return img;
      });
    }
    if (req.files.length != 0) {
      for (const file of req.files) {
        console.log(file, "File received");

        const randomInteger = Math.floor(Math.random() * 20000001);
        const imageDirectory = path.join(
          "public",
          "assets",
          "imgs",
          "productIMG"
        );
        const imgFileName = "cropped" + randomInteger + ".jpg";
        const imagePath = path.join(imageDirectory, imgFileName);

        const croppedImage = await sharp(file.path)
          .resize(400, 400, {
            fit: "fill",
          })
          .toFile(imagePath);

        if (croppedImage) {
          images.push(imgFileName);
        }
      }
    }
    await Product.findByIdAndUpdate(
      { _id: req.body.product_id },
      {
        $set: {
          name,
          category,
          price,
          description,
          quantity,
          image: images,
        },
      }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};


  module.exports = {
    loadProducts,
    loadPorductForm,
    addProduct,
    deleteProduct,
    loadEditProductForm,
    storeEditProduct

  }