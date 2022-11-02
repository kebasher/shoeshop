import Router from "express";
import routController from "./routController.js";
import { authenticateJWT } from "./routController.js";
import { adminauthenticateJWT } from "./routController.js";

const router = new Router()

router.get("/shoes", routController.getCatalogue)
router.get("/shoes/:id", routController.getShoeInfo)
router.post("/login",routController.Login)
router.get("/user",authenticateJWT, routController.getUserInfo)
router.get("/users", adminauthenticateJWT, routController.getUsers)
router.get("/cart",authenticateJWT, routController.getCart)
router.get("/orders",authenticateJWT, routController.getOrders)
router.post("/addshoe/:id",authenticateJWT, routController.addToCart)
router.delete("/removeshoe/:id",authenticateJWT, routController.removeFromCart)
router.put("/confirm", authenticateJWT,routController.confirmOrder)
router.put("/cancel", authenticateJWT,routController.cancelOrder)
router.post("/useradd",adminauthenticateJWT, routController.addUser)
router.put("/userupd/:id", adminauthenticateJWT,routController.updUser)
router.delete("/userdel/:id",adminauthenticateJWT, routController.delUser)



export default router; 