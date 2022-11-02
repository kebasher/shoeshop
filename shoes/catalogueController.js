import connection from "../index.js";
import jwt from "jsonwebtoken";

class catalogueController {
  async getCatalogue(req, res) {
    connection.query(
      "select idshoes,info,size,color,name,typename,quantity,price from shoes inner join waybill on shoes.idshoes = waybill.shoes_idshoes inner join `type` on shoes.fk_idtype=`type`.idtype order by idshoes",
      function (err, data) {
        if (err) return console.log(err);
        res.send(data);
      }
    );
  }

  async getShoeInfo(req, res) {
    try {
      const id = req.params.id;
      if (!id) res.status(400).json("ID not defined");
      connection.query(
        "select * from shoes inner join waybill on shoes.idshoes = waybill.shoes_idshoes inner join `type` on shoes.fk_idtype=`type`.idtype where idshoes=? order by idshoes",
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

  async getCart(req, res) {
    if (!req.user) {
      return res.sendStatus(403).json("something went wrong");
    }
    try {
      const token = req.headers.authorization;
      const accessTokenSecret = "jwttokensecret";
      const { id: fk_iduser } = jwt.verify(token, accessTokenSecret);

      if (!fk_iduser) res.status(400).json("something went wrong");
      connection.query(
        "SELECT idshoes,quantity,`name`,typename,size from `order` inner join cart on idorder = order_idorder inner join shoes on idshoes=shoes_idshoes inner join `type` on fk_idtype=idtype where fk_idorderstatus = 1 and fk_iduser=?",
        [fk_iduser],
        (err, data) => {
          if (err) return console.log(err);
          if (data.length) {
            res.send(data);
          } else {
            let date = new Date().toISOString().slice(0, 10);
            const paymenttype = "unknown";
            const fk_idorderstatus = 1;
            connection.query(
              "insert into `order` (date,paymenttype,fk_idorderstatus,fk_iduser) values (?,?,?,?)",
              [date, paymenttype, fk_idorderstatus, fk_iduser],
              (err, data) => {
                if (err) return console.log(err);
                res.send(data);
              }
            );
          }
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async addToCart(req, res) {
    if (!req.user) {
      return res.status(403).json("something went wrong");
    }
    try {
      const token = req.headers.authorization;
      const accessTokenSecret = "jwttokensecret";
      const { id: fk_iduser } = jwt.verify(token, accessTokenSecret);
      const shoes_idshoes = req.params.id;
      const quantity = 1;

      if (!fk_iduser || !shoes_idshoes)
        res.status(400).json("something went wrong");
      connection.query(
        "insert into cart (shoes_idshoes,order_idorder,quantity) select ?,idorder,? from `order` where fk_iduser=? and fk_idorderstatus = 1",
        [shoes_idshoes, quantity, fk_iduser],
        (err, data) => {
          if (err) return console.log(err);
          res.send(data);
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async removeFromCart(req, res) {
    if (!req.user) {
      return res.status(403).json("something went wrong");
    }
    try {
      const token = req.headers.authorization;
      const accessTokenSecret = "jwttokensecret";
      const { id: fk_iduser } = jwt.verify(token, accessTokenSecret);
      const shoes_idshoes = req.params.id;
      const quantity = 1;

      if (!fk_iduser || !shoes_idshoes)
        res.status(400).json("something went wrong");
      connection.query(
        "delete from cart where shoes_idshoes = ? and order_idorder=(select idorder from `order` where fk_iduser=? and fk_idorderstatus=1)",
        [shoes_idshoes, fk_iduser],
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

export default new catalogueController();
