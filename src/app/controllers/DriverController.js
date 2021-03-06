import * as Yup from "yup";
import { Op } from "sequelize"; // para trabalhar com mais operados nas consultas do banco de dados OR, AND, etc...
import Driver from "../models/Driver";
import User from "../models/User";

class DriverController {
  async store(req, res) {
    const schema = Yup.object().shape({
      cnh: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fails!" });
    }

    const driverExists = await Driver.findOne({
      attributes: ["id_driver"],
      where: {
        [Op.or]: {
          cnh: req.body.cnh,
          id_user: req.idUser,
        },
      },
    });

    if (driverExists) {
      return res.status(400).json({ error: "Driver already exists!" });
    }

    req.body.id_user = req.idUser;
    const { id_driver, cnh } = await Driver.create(req.body);

    return res.json({
      id_driver,
      cnh,
    });
  }

  async index(req, res) {
    const { page = 1, reg = 10 } = req.query;
    const drivers = await Driver.findAll({
      limit: reg,
      offset: (page - 1) * reg,
      order: ["id_driver"],
      attributes: ["id_driver", "cnh"],
    });

    if (!drivers) {
      return res.status(400).json({ error: "Drivers not exists!" });
    }

    return res.json(drivers);
  }

  async details(req, res) {
    const driver = await Driver.findOne({
      where: { id_driver: req.params.id_driver },
      attributes: ["id_driver", "cnh", "active"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id_user", "name", "email", "telephone"],
        },
      ],
    });

    if (!driver) {
      return res.status(400).json({ error: "Drivers not exists!" });
    }

    return res.json(driver);
  }

  async delete(req, res) {
    const driver = await Driver.findByPk(req.params.id_driver);

    if (!driver) {
      return res.status(400).json({ error: "Drivers not exists!" });
    }

    await driver.destroy(req.params.id_driver);

    return res.json({ message: "Driver excluded with success!" });
  }
}

export default new DriverController();
