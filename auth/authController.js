import jwt from "jsonwebtoken";
import connection from "../index.js";

class authController {
  adminauthenticateJWT(req, res, next) {
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
  }

  authenticateJWT(req, res, next) {
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

export default new authController();
