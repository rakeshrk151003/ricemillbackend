const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const multer = require('multer');
const cors=require('cors');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
process.env['NODE_TLS_REJECT_UNAUTHORIZED']='0';
const pool = new Pool({
  user: 'postgres',
  host: 'mydb.c7k2a4260dch.ap-south-1.rds.amazonaws.com',
  database: 'amman',
  password: 'postgres',
  port: 5432,
  ssl:true
});

const upload = multer();

app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to handle form submissions from contact form
app.post('/api/submitForm', upload.none(), async (req, res) => {
  const { name, phone, locality, ricebags, message } = req.body;
  console.log( name, phone, locality, ricebags, message);
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO form_data VALUES ($1, $2, $3, $4, $5)',
      [name, phone, locality, ricebags, message]
    );
    client.release();
    res.send('Form data stored successfully');
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Error storing form data');
  }
});

// Endpoint to handle testimonials form submissions
app.post('/api/submitTestimonial', bodyParser.json(), async (req, res) => {
  const { name, location, text } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO testimonials (name, location, text) VALUES ($1, $2, $3)',
      [name, location, text]
    );
    client.release();
    res.send('Testimonial stored successfully');
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Error storing testimonial');
  }
});


// Endpoint to retrieve testimonials
app.get('/api/getTestimonials', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM testimonials');
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send('Error fetching testimonials');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
