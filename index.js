const bodyParser = require("body-parser");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult } = require("express-validator");
const Sequelize = require("sequelize");
const generateQRCode = require("./routes/qrcode");
const session = require("express-session");

const sequelize = new Sequelize("2dr3_fitnes_aerobic", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: false,
});
const { Model, DataTypes, Op } = Sequelize;
const app = express();
const port = 3000;

//Template Engine
app.set("view engine", "ejs");
app.use(express.static(process.cwd()));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "gym", // Ganti dengan kunci rahasia yang aman
    resave: false,
    saveUninitialized: false,
  })
);

//model
class Member extends Model {}
Member.init(
  {
    member_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_telp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    masa_berlaku: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Member",
    tableName: "member",
    timestamps: false,
  }
);

//register
app.get("/", (req, res) => {
  res.render("dashboard", {
    layout: "layouts/main",
  });
});
app.post(
  "/",
  [
    body("nama_reg")
      .notEmpty()
      .withMessage("form tidak boleh ada yang kosong!"),
    body("alamat_reg")
      .notEmpty()
      .withMessage("form tidak boleh ada yang kosong!"),
    body("no_telp_reg")
      .notEmpty()
      .withMessage("form tidak boleh ada yang kosong!"),
    body("Period_member_reg")
      .notEmpty()
      .withMessage("form tidak boleh ada yang kosong!"),
    body("no_telp_reg").notEmpty().withMessage("No Telphone tidak valid"),
  ],
  async (req, res) => {
    //const { nama_reg, alamat_reg, no_telp_reg, Period_member_reg } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("dashboard", {
        layout: "layouts/main",
        errors: errors.array(),
      });
    } else {
      let tanggal = new Date(); // Perbaikan: Panggil Date tanpa Date.now
      let expired_member = new Date(tanggal); // Buat salinan objek tanggal
      expired_member.setMonth(
        expired_member.getMonth() + parseInt(req.body.Period_member_reg)
      );
      let member = await Member.create({
        nama: req.body.nama_reg,
        alamat: req.body.alamat_reg,
        no_telp: req.body.no_telp_reg,
        masa_berlaku: expired_member,
      });
      res.status(201).redirect(`/generate/${member.member_id}`);
    }
  }
);

//view member
app.get("/tables", async (req, res) => {
  try {
    let result = await Member.findAll({
      attributes: ["nama", "alamat", "no_telp", "masa_berlaku"],
    });

    res.render("tables", {
      layout: "layouts/main",
      members: result, // Mengirim data member ke dalam template
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).send("Internal Server Error");
  }
});

//generateqr
app.get("/generate", (req, res) => {
  res.render("generate", {
    layout: "layouts/main",
  });
});
app.get("/generate/:id", async (req, res) => {
  try {
    const memberId = req.params.id; // Mengambil ID anggota dari URL

    // Melakukan pencarian anggota berdasarkan ID
    const member = await Member.findByPk(memberId);

    if (!member) {
      return res.status(404).send("Member not found");
    }
    const qrCodeData = await generateQRCode(member.member_id);
    res.render("generate", {
      layout: "layouts/main",
      member: member,
      qrCodeData: qrCodeData,
    });
    //console.log(qrCodeData);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).send("Internal Server Error");
  }
});

//absent
app.get("/wallet", (req, res) => {
  res.render("wallet", {
    layout: "layouts/main",
  });
});
app.get("/wallet/:id", async (req, res) => {
  try {
    const memberId = req.params.id; // Mengambil ID anggota dari URL

    // Melakukan pencarian anggota berdasarkan ID
    const member = await Member.findByPk(memberId);

    if (!member) {
      return res.status(404).send("Member not found");
    }

    res.render("wallet", {
      layout: "layouts/main",
      member: member,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/cek", (req, res) => {
  res.render("cek", {
    layout: "layouts/main",
  });
});
app.get("/cek/:id", async (req, res) => {
  try {
    const memberId = req.params.id; // Mengambil ID anggota dari URL

    // Melakukan pencarian anggota berdasarkan ID
    const member = await Member.findByPk(memberId);

    if (!member) {
      return res.status(404).send("Member not found");
    }

    res.render("cek", {
      layout: "layouts/main",
      member: member,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
