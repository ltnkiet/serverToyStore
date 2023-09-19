const router = require("express").Router();
const admin = require("firebase-admin");
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// Add Product
router.post("/", async (req, res) => {
  try {
    const productName = req.body.productName;
    // Kiểm tra xem sản phẩm đã tồn tại dựa trên productName
    const productQuery = await db
      .collection("products")
      .where("productName", "==", productName)
      .get();
    if (!productQuery.empty) {
      return res.status(400).send({
        success: false,
        msg: `Sản phẩm với tên ${productName} đã tồn tại.`,
      });
    }

    const id = Date.now();
    const data = {
      productId: id,
      productName: req.body.productName,
      productCategory: req.body.productCategory,
      productPrice: req.body.productPrice,
      productQty: req.body.productQty,
      productDes: req.body.productDes,
      productImage: req.body.productImage,
    };
    const response = await db.collection("products").doc(`/${id}/`).set(data);
    return res.status(200).send({ success: true, data: response });
  } catch (error) {
    return res.send({ success: false, msg: `Error: ${error}` });
  }
});

// Get All Products
router.get("/", async (req, res) => {
  (async () => {
    try {
      let query = db.collection("products");
      let response = [];
      await query.get().then((querysnap) => {
        let docs = querysnap.docs;
        docs.map((doc) => {
          response.push({ ...doc.data() });
        });
        return response;
      });
      return res.status(200).send({ success: true, data: response });
    } catch (err) {
      return res.send({ success: false, msg: `Error: ${err}` });
    }
  })();
});

// Get a Product
router.get("/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const query = await db.collection("products").doc(productId).get();
    if (!query.exists) {
      return res.status(404).send({
        success: false,
        msg: `Product with ID ${productId} not found.`,
      });
    }

    const result = query.data();
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ success: false, msg: `Error: ${error}` });
  }
});

// Update Product
router.put("/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const query = db.collection("products").doc(productId);
    const productDoc = await query.get();

    if (!productDoc.exists) {
      return res.status(404).send({
        success: false,
        msg: `Product with ID ${productId} not found.`,
      });
    }

    const updatedData = {
      productName: req.body.productName || productDoc.data().productName,
      productCategory:
        req.body.productCategory || productDoc.data().productCategory,
      productPrice: req.body.productPrice || productDoc.data().productPrice,
      productQty: req.body.productQty || productDoc.data().productQty,
      productDes: req.body.productDes || productDoc.data().productDes,
      productImage: req.body.productImage || productDoc.data().productImage,
    };

    await productRef.update(updatedData);

    return res.status(200).send({
      success: true,
      msg: `Product with ID ${productId} updated successfully.`,
    });
  } catch (error) {
    return res.status(500).send({ success: false, msg: `Error: ${error}` });
  }
});

// Delete Product
router.delete("/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    await db
      .collection("products")
      .doc(`/${productId}/`)
      .delete()
      .then((result) => {
        return res.status(200).send({ success: true, data: result });
      });
  } catch (error) {
    return res.send({ success: false, msg: `Error: ${error}` });
  }
});

//Add to Card
router.post("/addToCart/:userId", async (req, res) => {
  const userId = req.params.userId;
  const productId = req.body.productId;
  try {
    const doc = await db
      .collection("cartItems")
      .doc(`/${userId}/`)
      .collection("items")
      .doc(`/${productId}/`)
      .get();
    if (doc.data()) {
      const quantity = doc.data().quantity + 1;
      const updateItem = await db
        .collection("cartItems")
        .doc(`/${userId}/`)
        .collection("items")
        .doc(`/${productId}/`)
        .update({ quantity });
      return res.status(200).send({ success: true, data: updateItem });
    } else {
      const data = {
        productId: productId,
        productName: req.body.productName,
        productPrice: req.body.productPrice,
        productImage: req.body.productImage,
        quantity: 1,
      };
      const addItems = await db
        .collection("cartItems")
        .doc(`/${userId}/`)
        .collection("items")
        .doc(`/${productId}/`)
        .set(data);
      return res.status(200).send({ success: true, data: addItems });
    }
  } catch (error) {
    return res.send({ success: false, msg: `Error: ${error}` });
  }
});

//get Card item
router.get("/getCart/:userId", async (req, res) => {
  const userId = req.params.userId;
  (async () => {
    try {
      let query = db
        .collection("cartItems")
        .doc(`/${userId}/`)
        .collection("items");
      let result = [];

      await query.get().then((querysnap) => {
        let docs = querysnap.docs;

        docs.map((doc) => {
          result.push({ ...doc.data() });
        });
        return result;
      });

      return res.status(200).send({ success: true, data: result });
    } catch (error) {
      return res.send({ success: false, msg: `Error: ${error}` });
    }
  })();
});

//update Cart to increment and decrement the quantiry
router.post("/updateCart/:user_id", async (req, res) => {
  const userId = req.params.user_id;
  const productId = req.query.productId;
  const type = req.query.type;

  try {
    const doc = await db
      .collection("cartItems")
      .doc(`/${userId}/`)
      .collection("items")
      .doc(`/${productId}/`)
      .get();

    if (doc.data()) {
      if (type === "increment") {
        const quantity = doc.data().quantity + 1;
        const updateItem = await db
          .collection("cartItems")
          .doc(`/${userId}/`)
          .collection("items")
          .doc(`/${productId}/`)
          .update({ quantity });
        return res.status(200).send({ success: true, data: updateItem });
      } else {
        if (doc.data().quantity === 1) {
          await db
            .collection("cartItems")
            .doc(`/${userId}/`)
            .collection("items")
            .doc(`/${productId}/`)
            .delete()
            .then((result) => {
              return res.status(200).send({ success: true, data: result });
            });
        } else {
          const quantity = doc.data().quantity - 1;
          const updateItem = await db
            .collection("cartItems")
            .doc(`/${userId}/`)
            .collection("items")
            .doc(`/${productId}/`)
            .update({ quantity });
          return res.status(200).send({ success: true, data: updateItem });
        }
      }
    }
  } catch (error) {
    return res.send({ success: false, msg: `Error: ${error}` });
  }
});

router.post("/checkOut", async(req, res) => {})

// Route để lấy sản phẩm theo tên danh mục
router.get("/:categoryName", async (req, res) => {
  try {
    const categoryName = req.params.categoryName;

    // Tìm danh mục có categoryName tương ứng
    const categoryQuery = await db
      .collection("category")
      .where("categoryName", "==", categoryName)
      .get();

    if (categoryQuery.empty) {
      return res.status(404).send({
        success: false,
        msg: `Không tìm thấy danh mục với tên: ${categoryName}`,
      });
    }

    // Lấy danh mục đầu tiên có categoryName tương ứng
    const category = categoryQuery.docs[0].data();
    const catName = category.categoryName;

    // Tìm tất cả sản phẩm thuộc danh mục có categoryId tương ứng
    const productsQuery = await db
      .collection("products")
      .where("productCategory", "===", catName)
      .get();

    if (productsQuery.empty) {
      return res.status(404).send({
        success: false,
        msg: `Không có sản phẩm nào thuộc danh mục ${categoryName}`,
      });
    }

    // Tạo một mảng chứa dữ liệu của tất cả sản phẩm
    const productsData = [];
    productsQuery.forEach((doc) => {
      const product = doc.data();
      productsData.push(product);
    });

    return res.status(200).send({ success: true, data: productsData });
  } catch (error) {
    return res.status(500).send({ success: false, msg: `Lỗi: ${error}` });
  }
});

module.exports = router;
