import connection from "./index.js";
import jwt from "jsonwebtoken";

const authenticateJWT = (req, res, next) => {
  if (req.method === "options") {
    next();
  }
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const accessTokenSecret = "jwttokensecret";
    const id = jwt.verify(authHeader, accessTokenSecret);
    req.user = id;
    next();
  } else {
    res.sendStatus(401).json("something went wrong");
  }
};

const adminauthenticateJWT = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const accessTokenSecret = "jwttokensecret";
    const { id, role } = jwt.verify(authHeader, accessTokenSecret);
    if (role == 1) {
      return res.status(400).json("Don't have permission");
    }
    req.user = id;
    next();
  } else {
    res.sendStatus(401).json("something went wrong");
  }
};

class routController {
  async getCatalogue(req, res) {
    connection.query(
      "select idshoes,info,size,color,name,typename,quantity,price from shoes inner join waybill on shoes.idshoes = waybill.shoes_idshoes inner join `type` on shoes.fk_idtype=`type`.idtype order by idshoes",
      function (err, data) {
        if (err) return console.log(err);
        res.send(data);
      }
    );
  }

  async getUsers(req, res) {
    if (!req.user) {
      return res.sendStatus(403).json("something went wrong");
    }
    connection.query(
      "SELECT * FROM user ORDER BY iduser desc limit 10",
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

  async getUserInfo(req, res) {
    if (!req.user) {
      return res.sendStatus(403).json("something went wrong");
    }
    try {
      const token = req.headers.authorization;
      const accessTokenSecret = "jwttokensecret";
      const { id: id } = jwt.verify(token, accessTokenSecret);

      if (!id) res.status(400).json("ID not defined");
      connection.query(
        "SELECT * from user where iduser=?",
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

  async delUser(req, res) {
    if (!req.user) {
      return res.sendStatus(403).json("something went wrong");
    }
    try {
      const id = req.params.id;
      if (!id) res.status(400).json("ID not defined");
      connection.query("DELETE from user where iduser=?", [id], (err, data) => {
        if (err) return console.log(err);
        res.json(data);
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updUser(req, res) {
    if (!req.user) {
      return res.sendStatus(403).json("something went wrong");
    }
    try {
      const iduser = req.params.id;
      const { fullname, birthday, password, phone, size } = req.body;

      if (!iduser || !req.body) res.status(400).json("Data not defined");
      connection.query(
        "UPDATE user SET fullname=?, birthday=?, password =?, phone=?, size =? WHERE iduser=?",
        [fullname, birthday, password, phone, size, iduser],
        (err, data) => {
          if (err) return console.log(err);
          res.json(data);
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async addUser(req, res) {
    if (!req.user) {
      return res.sendStatus(403).json("something went wrong");
    }
    try {
      const { fullname, birthday, password, phone, size } = req.body;
      const fk_idrole = 1;
      if (!req.body) res.status(400).json("Data not defined");
      connection.query(
        "Insert into user (fullname,birthday,password,phone,size,fk_idrole) values(?,?,?,?,?,?)",
        [fullname, birthday, password, phone, size, fk_idrole],
        (err, data) => {
          if (err) return console.log(err);
          res.json(data);
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

  async getOrders(req,res){
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

  Login(req, res) {
    try {
      const { phone, password } = req.body;
      if (!req.body) res.status(400).json("Data not defined");
      connection.query(
        "select * from user where phone = ? and password = ?",
        [phone, password],
        (err, data) => {
          if (err) return console.log(err);
          if (data.length) {
            const accessTokenSecret = "jwttokensecret";
            const accessToken = jwt.sign(
              { id: data[0].iduser, role: data[0].fk_idrole },
              accessTokenSecret,
              { expiresIn: "24h" }
            );
            res.json(accessToken);
          } else res.status(401).json("Username or password incorrect");
        }
      );
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export { authenticateJWT };
export { adminauthenticateJWT };
export default new routController();
