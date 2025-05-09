const express = require("express");
const morgan = require("morgan");
const database = require("./database");
const cors = require("cors");

const app = express();
app.set("port", 4000);
app.listen(app.get("port"));
console.log("Estoy ejecutandome en el puerto " + app.get("port"));

//Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(morgan("dev"));
app.use(express.json());

//Rutas
app.get("/usersTable", async (req, res) => {
  const connection = await database.getConnection();
  const result = await connection.query("SELECT * from usuarios");
  res.json(result.rows);
});

app.post("/inputUsers", async (req, res) => {
  const conect = await database.getConnection();
  const usersData = req.body;
  console.log(req.body);

  const success = [];

  try {
    for (const user of usersData) {
      const {
        correo,
        nombre,
        genero,
        fecha_nacimiento,
        cargo,
        fecha_ingreso,
        area_id,
        subarea_id,
        criticidad,
        monitor,
        administrador,
        adminglobal,
      } = user;

      try {
        await conect.query(
          "INSERT INTO usuarios (correo, nombre, genero, fecha_nacimiento, cargo, fecha_ingreso, area_id, subarea_id, criticidad, monitor, administrador, adminglobal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (correo) DO UPDATE SET nombre = excluded.nombre, genero = excluded.genero, fecha_nacimiento = excluded.fecha_nacimiento, cargo = excluded.cargo, fecha_ingreso = excluded.fecha_ingreso, area_id = excluded.area_id, subarea_id = excluded.subarea_id, criticidad = excluded.criticidad, monitor = excluded.monitor, administrador = excluded.administrador, adminglobal = excluded.adminglobal",
          [
            correo,
            nombre,
            genero,
            fecha_nacimiento,
            cargo,
            fecha_ingreso,
            area_id,
            subarea_id,
            criticidad,
            monitor,
            administrador,
            adminglobal,
          ]
        );
        success.push(user);
      } catch (error) {
        console.error(`Error al insertar el usuario: ${user.correo}`, error);
      }
    }
  } catch (error) {
    console.error(error);
  }

  if (success.length > 0) {
    res.status(200).json(success);
    console.log("Se realiza carga de registros");
  } else {
    res.status(500).json("error!");
    console.log("Ningun usuario ha sido registrado");
  }
});

app.delete("/deleteUsers", async (req, res) => {
  try {
    const gConect = await database.getConnection();
    const userDataArray = req.body;

    if (!Array.isArray(userDataArray) || userDataArray.length === 0) {
      return res.status(400).json({
        error: "El cuerpo de la solicitud debe ser un array no vacío",
      });
    }

    const deletedUsers = [];

    for (const userData of userDataArray) {
      const { correo } = userData;

      if (!correo) {
        console.error("Usuario sin correo:", userData);
        continue;
      }

      const result = await gConect.query(
        "DELETE FROM usuarios WHERE correo = $1 RETURNING *",
        [correo]
      );

      if (result.rowCount === 0) {
        console.warn(`No se encontró ningún usuario con correo: ${correo}`);
      } else {
        deletedUsers.push(result.rows[0]);
      }
    }

    if (deletedUsers.length > 0) {
      res
        .status(200)
        .json({ message: "Usuarios eliminados correctamente", deletedUsers });
    } else {
      res.status(404).json({ error: "Ningún usuario fue eliminado" });
    }
  } catch (error) {
    console.error("Error al eliminar usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
