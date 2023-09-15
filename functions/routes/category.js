const router = require("express").Router();
const admin = require("firebase-admin");
const db = admin.firestore();
// db.settings({ ignoreUndefinedProperties: true });

// Add Category
router.post("/", async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    // Kiểm tra xem sản phẩm đã tồn tại dựa trên categoryName
    const categoryQuery = await db
      .collection("category")
      .where("categoryName", "==", categoryName)
      .get();
    if (!categoryQuery.empty) {
      return res.status(400).send({
        success: false,
        msg: `Danh mục  ${categoryName} đã tồn tại.`,
      });
    }
    const id = Date.now();
    const data = {
      categoryId: id,
      categoryName: req.body.categoryName,
      categoryImage: req.body.categoryImage,
    };
    const response = await db.collection("category").doc(`/${id}/`).set(data);
    return res.status(200).send({ success: true, data: response });
  } catch (error) {
    return res.send({ success: false, msg: `Error: ${error}` });
  }
});

// Get All Category
router.get("/", async (req, res) => {
  (async () => {
    try {
      let query = db.collection("category");
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





module.exports = router;
