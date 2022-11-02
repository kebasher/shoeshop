import connection from "../index.js";
import jwt from "jsonwebtoken";

class userController {
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
}

export default new userController();
