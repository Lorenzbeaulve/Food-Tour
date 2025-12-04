const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

let pool = require("./conn");
const app = express();
app.use(cors());
app.use(express.json());
