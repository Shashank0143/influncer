// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import AuthRoute from './Routes/AuthRoute.js';
// import UserRoute from './Routes/UserRoute.js';
// import PostRoute from './Routes/PostRoute.js';
// import UploadRoute from './Routes/UploadRoute.js';


// // Routes
// const app = express();


// // to serve images for public (public folder)
// app.use(express.static('public'));
// app.use('/images', express.static('images'));


// // MiddleWare
// app.use(bodyParser.json({ limit: "30mb", extended: true }));
// app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// app.use(cors());

// dotenv.config();

// mongoose.connect
//     (process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true }
//     ).then(() =>
//         app.listen(process.env.PORT, () => console.log(`listening at ${process.env.PORT}`))
//     ).catch((error) =>
//         console.log('error')
//     )


// // uses of routes

// app.use('/auth', AuthRoute);
// app.use('/user', UserRoute);
// app.use('/post', PostRoute);
// app.use('/upload', UploadRoute);


import express from 'express';
import mysql from 'mysql2/promise'; // Use mysql2 for Promise-based API
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';
import UploadRoute from './Routes/UploadRoute.js';

// Initialize Express app
const app = express();

// Serve images for public (public folder)
app.use(express.static('public'));
app.use('/images', express.static('images'));

// Middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

dotenv.config();

// MySQL database connection
async function connectToMySQL() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
        console.log('Connected to MySQL database');
        return connection;
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        process.exit(1); // Exit the process if the connection fails
    }
}

// Start the server after connecting to MySQL
async function startServer() {
    const db = await connectToMySQL();

    // Make the database connection available to routes
    app.set('db', db);

    // Routes
    app.use('/auth', AuthRoute);
    app.use('/user', UserRoute);
    app.use('/post', PostRoute);
    app.use('/upload', UploadRoute);

    // Start the server
    app.listen(process.env.PORT, () => {
        console.log(`Listening at ${process.env.PORT}`);
    });
}

startServer();