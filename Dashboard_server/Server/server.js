const express = require("express");
const bodyparser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Doctor = require("./models/doctorSchema")
const Patient = require("./models/patientSchema")
const PCS = require("./models/pcsSchema")
const MOXFQ = require("./models/moxfq_Schema")
const SF_36 = require("./models/sf_36")
const Image = require("./models/image_model")
const Data = require('./models/dataShema')
const PatientInfo = require('./models/patientInfo')
const cors = require("cors")
const app = express();

const PORT = 3001;
const SECRET_KEY = "HACKWIT";
const DB_URL = "mongodb://0.0.0.0:27017/pain_management";



//connect to DB
mongoose
    .connect(DB_URL, {})
    .then(() => console.log("connected to MongoDB"))
    .catch((err) => console.log('Error', err))

app.use(bodyparser.json());
app.use(cors());


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const customer = await Doctor.findOne({ email });

  if (!customer) {
      return res.status(401).json({ message: "Authentication failed! User doesnot exist" });
  }

  const passwordMatch = await bcrypt.compare(password, customer.password);

  if (!passwordMatch) {
      return res.status(401).json({ message: "Authentication failed! wrong Password" });
  }

  const token = jwt.sign(
      { email: customer.email, role: "admin" },
      SECRET_KEY,
      { expiresIn: "3h" });

  res.json({ token });
});

// Doctor Schema:

app.post("/doctor", async (req, res) => {
  const { userid, firstname, lastname, phone, email, password } = req.body;
  if (!userid || !firstname || !lastname || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = new Doctor({ userid, firstname, lastname, phone, email, password: hashedPassword });
  try {
      await customer.save();
      res.json({ message: "User Saved Successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error Occurred" });
  }
});

app.get('/doctors', async (req, res) => {

    try {
        const doctors = await Doctor.find();
        res.status(200).send(doctors);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.get('/doctor/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const doc = await Doctor.findOne({ email: email });
    res.status(200).json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/getDoctor/:id', async (req, res) => {
    const doctorId = req.params.id;
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the doctor', error: error.message });
    }
});

app.put('/updateDoctor/:id', async (req, res) => {
    const id = req.params.id;
    const objectId = new mongoose.Types.ObjectId(id);

    try {
        const user = await Doctor.findByIdAndUpdate(objectId, {
            userid: req.body.userid,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while updating the user', error: err.message });
    }
});


app.delete('/deleteDoctor/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await Doctor.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while deleting the doctor', error: err.message });
    }
});

//Patient Schema

app.post('/patient', async (req, res) => {
    const patient = new Patient(req.body);
    try {
        const savedPatient = await patient.save();
        res.status(200).send(savedPatient);
    } catch (error) {
        res.status(400).send(error.message)
    }
})



app.get('/patients', async (req, res) => {

    try {
        const patients = await Patient.find();
        res.status(200).send(patients);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.delete("/patients/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const deletedPatient = await Patient.findOneAndDelete({ email: email });
  
      if (deletedPatient) {
        res.status(200).json({ message: "Patient deleted successfully" });
      } else {
        res.status(404).json({ message: "Patient not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

//PCS Schema

app.post('/pcs', async (req, res) => {
    const pcs = new PCS(req.body);
    try {
        const savedPcs = await pcs.save();
        res.status(200).send(savedPcs);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.get('/pcss', async (req, res) => {
    try {
        const email = req.query.email;
        const pcss = await PCS.find({ email: email });
        res.status(200).send(pcss);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/pcs/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const deletedPcs = await PCS.findOneAndDelete({ email: email });
  
      if (deletedPcs) {
        res.status(200).json({ message: "Pcs deleted successfully" });
      } else {
        res.status(404).json({ message: "Pcs not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

//view patient

app.get('/viewpatient', async (req, res) => {
    try {
        const email = req.query.email;
        const pcss = await Patient.find({ email: email });
        res.status(200).send(pcss);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// moxfq endpoints

app.post('/moxfq', async (req, res) => {
    const moxfq = new MOXFQ(req.body);
    try {
        const savedmoxfq = await moxfq.save();
        res.status(200).send(savedmoxfq);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.get('/moxfqs', async (req, res) => {
    try {
        const email = req.query.email;
        const moxfqs = await MOXFQ.find({ email: email });
        res.status(200).send(moxfqs);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/moxfq/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const deletedmoxfq = await MOXFQ.findOneAndDelete({ email: email });
  
      if (deletedmoxfq) {
        res.status(200).json({ message: "Moxfq deleted successfully" });
      } else {
        res.status(404).json({ message: "Moxfq not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

//sf_36 endpoints

app.post('/sf_36', async (req, res) => {
    const sf_36 = new SF_36(req.body);
    try {
        const savedsf = await sf_36.save();
        res.status(200).send(savedsf);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.get('/sf_36s', async (req, res) => {
    try {
        const email = req.query.email;
        const sf_36s = await SF_36.find({ email: email });
        res.status(200).send(sf_36s);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/sf_36s/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const deletesf = await SF_36.findOneAndDelete({ email: email });
  
      if (deletesf) {
        res.status(200).json({ message: "sf_36s deleted successfully" });
      } else {
        res.status(404).json({ message: "sf_36s not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });


//images

app.get('/images', async (req, res) => {
    try {
        const email = req.query.email;
        const image = await Image.find({ email: email });
        res.status(200).send(image);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/image/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const deleteimg = await Image.findOneAndDelete({ email: email });
  
      if (deleteimg) {
        res.status(200).json({ message: "Img deleted successfully" });
      } else {
        res.status(404).json({ message: "Img not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

app.post('/patieninfos', async (req, res) => {
    const value = new PatientInfo(req.body);
    try {
        const details = await value.save();
        res.status(200).send(details);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.get('/patientinfo', async (req, res) => {
    try {
        const email = req.query.email;
        const detail = await PatientInfo.find({ email: email });
        res.status(200).send(detail);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.delete("/patientinfo/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const deleteinfo = await PatientInfo.findOneAndDelete({ email: email });
  
      if (deleteinfo) {
        res.status(200).json({ message: "Info deleted successfully" });
      } else {
        res.status(404).json({ message: "Info not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });


app.listen(PORT, () => {
    console.log("server is running on PORT", PORT)
});