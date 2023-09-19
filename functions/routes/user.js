const router = require("express").Router();
const { Router } = require("express");
const admin = require("firebase-admin");

router.get("/jwtVerfication", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(500).send({ msg: "Token Not Found" });
  }
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decodedValue = await admin.auth().verifyIdToken(token);
    if (!decodedValue) {
      return res
        .status(500)
        .json({ success: false, msg: "Unauthorized access" });
    }
    return res.status(200).json({ success: true, data: decodedValue });
  } catch (err) {
    return res.send({
      success: false,
      msg: `Error in extracting the token: ${err}`,
    });
  }
});

//Get All User
const listAllUser = async (nextPageToken) => {
  admin
    .auth()
    .listUsers(1000, nextPageToken)
    .then((listUserResult) => {
      listUserResult.users.forEach((rec) => {
        data.push(rec.toJSON());
      });
      if (listUserResult.pageToken) {
        listAllUser(listUserResult.pageToken);
      }
    })
    .catch((err) => console.log(err));
};

listAllUser();
router.get("/", async (req, res) => {
  listAllUser();
  try {
    return res
      .status(200)
      .send({ success: true, data: data, dataCount: data.length });
  } catch (error) {
    return res.send({
      success: false,
      msg: `Error: ${error}`,
    });
  }
});

module.exports = router;
