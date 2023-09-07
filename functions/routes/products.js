const router = require("express").Router();
const admin = require("firebase-admin");
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

router.post("/", async (req, res) => {
  try {
    const id = Date.now();
    const data = {
      productId: id,
      productName: req.body.productName,
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

// Get All Category
// router.get("/", async (req, res) => {
//   (async () => {
//     try {
//       let query = db.collection("products");
//       let response = [];
//       await query.get().then((querysnap) => {
//         let docs = querysnap.docs;
//         docs.map((doc) => {
//           response.push({ ...doc.data() });
//         });
//         return response;
//       });
//       return res.status(200).send({ success: true, data: response });
//     } catch (err) {
//       return res.send({ success: false, msg: `Error: ${err}` });
//     }
//   })();
// });
