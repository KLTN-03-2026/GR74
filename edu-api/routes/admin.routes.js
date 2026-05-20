const router = require("express").Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const adminCtrl = require("../controllers/admin.controller");

router.get("/admin/dashboard", auth, admin, adminCtrl.getDashboard);
router.get("/admin/users", auth, admin, adminCtrl.getUsers);
router.patch("/admin/users/:id", auth, admin, adminCtrl.updateUser);
router.get("/admin/posts", auth, admin, adminCtrl.getPosts);
router.delete("/admin/posts/:id", auth, admin, adminCtrl.deletePost);
router.get("/admin/reports", auth, admin, adminCtrl.getReports);
router.patch("/admin/reports/:id", auth, admin, adminCtrl.updateReport);

module.exports = router;
