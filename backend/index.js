const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
    host: 'srv1139.hstgr.io',   // Try using the hostname
    // Correct IP
  user: 'u214111209_incentum_data',  // Your MySQL username
  password: 'Faguniya@incentum04',   // Your MySQL password
  database: 'u214111209_UserIncentum',  // Your database name
  connectTimeout: 10000  // Increase connection timeout to 10 seconds
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err.stack);
    return;
  }
  console.log('Connected to the Hostinger MySQL database.');
});

app.get('/', (req, res) => {
  return res.json("From Backend Side");
});

app.listen(8081, () => {
  console.log("listening on port 8081");
});
