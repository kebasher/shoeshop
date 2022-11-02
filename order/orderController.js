import connection from "../index.js";
import jwt from "jsonwebtoken";

class orderController {
  async confirmOrder(req, res) {
    if (!req.user) {
      return res.status(403).json("something went wrong");
    }
    try {
      const token = req.headers.authorization;
      const accessTokenSecret = "jwttokensecret";
      const { id: fk_iduser } = jwt.verify(token, accessTokenSecret);

      if (!fk_iduser) res.status(400).json("something went wrong");
      connection.query(
        "update `order` set fk_idorderstatus=2 where fk_iduser=? and fk_idorderstatus = 1",
        [fk_iduser],
        (err, data) => {
          if (err) return console.log(err);
          res.send(data);
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async cancelOrder(req, res) {
    if (!req.user) {
      return res.status(403).json("something went wrong");
    }
    try {
      const token = req.headers.authorization;
      const accessTokenSecret = "jwttokensecret";
      const { id: fk_iduser } = jwt.verify(token, accessTokenSecret);

      if (!fk_iduser) res.status(400).json("something went wrong");
      connection.query(
        "update `order` set fk_idorderstatus=5 where fk_iduser=? and fk_idorderstatus = 2",
        [fk_iduser],
        (err, data) => {
          if (err) return console.log(err);
          res.send(data);
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getOrders(req, res) {
    if (!req.user) {
      return res.sendStatus(403).json("something went wrong");
    }
    try {
      const token = req.headers.authorization;
      const accessTokenSecret = "jwttokensecret";
      const { id: id } = jwt.verify(token, accessTokenSecret);

      if (!id) res.status(400).json("ID not defined");
      connection.query(
        "select idorder,date,statusname from `order` inner join orderstatus on `order`.fk_idorderstatus=orderstatus.idorderstatus where fk_iduser=?",
        [id],
        (err, data) => {
          if (err) return console.log(err);
          res.send(data);
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new orderController();
