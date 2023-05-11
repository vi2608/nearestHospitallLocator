const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3508;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
//mongoose.connect('mongodb://localhost:27017/Vipul', { useNewUrlParser: true });
mongoose.connect('mongodb+srv://Fidgeting:0J5XSU55nH56Mijw@testcluster.vnwjzfa.mongodb.net/Vipul?retryWrites=true&w=majority').then(() => {
 // const db = mongoose.connection;  
//Listen for requests
  app.listen(port, () => console.log(`Conntected to DB & Server running on port ${port}`));
  }).catch((error) => {
  console.log(error)
 });

// Define schema for hospitals
const hospitalSchema = new mongoose.Schema({
  name: String,
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  emergencies: [String],
});

hospitalSchema.index({ location: '2dsphere' });
// Create a model for hospitals
const hospital = mongoose.model('hospitals', hospitalSchema);
hospital.ensureIndexes();




// API endpoint to find the nearest hospital
app.get('/nearest', async (req, res) => {
  try {
    // Parse the user's location and medical emergency type from the query parameters
    const userLocation = { type: 'Point', coordinates: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)] };
   
    //const userLocation = { type: 'Point', coordinates: [8.649378,49.415562] };
    const emergencyType = req.query.emergencyType;
    console.log(req.query.emergencyType);
    console.log(userLocation);
   console.log(req.query.latitude);
   console.log(req.query.longitude);


  //db.hospital.index({ location: "2dsphere" });

   // const name = req.query.name
    //const nearestHospital = await hospital.findOne({ name:'Heidelberg University Hospital'});
    // Find the nearest hospital to the user's location that can handle the emergency type
    const nearestHospital = await hospital.findOne({
      location: {
        $near: {
          $geometry: userLocation,
          $maxDistance: 10000 // 100 kilometers
        }
      },
      emergencies: {
        $eq: emergencyType
      }
    });

    if (nearestHospital) {
      res.status(200).json({ message: `Nearest hospital for ${emergencyType}: ${nearestHospital.name}` });
    } else {
      res.status(404).json({ message: `No hospitals found for ${emergencyType} within 10 kilometers` });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
// const port = 3509;
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


