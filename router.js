import Router from "express";
import catalogueController from "./shoes/catalogueController.js";
import userController from "./user/userController.js";
import authController from "./auth/authController.js";
import orderController from "./order/orderController.js";

const router = new Router()

router.get("/shoes", catalogueController.getCatalogue)
router.get("/shoes/:id", catalogueController.getShoeInfo)
router.post("/login",authController.Login)
router.get("/user",authController.authenticateJWT, userController.getUserInfo)
router.get("/users", authController.adminauthenticateJWT, userController.getUsers)
router.get("/cart",authController.authenticateJWT, catalogueController.getCart)
router.get("/orders",authController.authenticateJWT, orderController.getOrders)
router.post("/addshoe/:id",authController.authenticateJWT, catalogueController.addToCart)
router.delete("/removeshoe/:id",authController.authenticateJWT, catalogueController.removeFromCart)
router.put("/confirm", authController.authenticateJWT,orderController.confirmOrder)
router.put("/cancel", authController.authenticateJWT,orderController.cancelOrder)
router.post("/useradd",authController.adminauthenticateJWT, userController.addUser)
router.put("/userupd/:id", authController.adminauthenticateJWT,userController.updUser)
router.delete("/userdel/:id",authController.adminauthenticateJWT, userController.delUser)

export default router; 