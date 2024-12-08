const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
const helmet = require("helmet");
require('dotenv').config();

const port = process.env.PORT || 3002;
const app = express();
app.use(express.json());

app.use(cors({ origin: '*' })); 
app.use(express.json());

app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${process.env.AUTH_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  });
// app.use(cors()); 

// app.use(
//     cors({
//       origin: 'https://kajeme-portfolio.vercel.app',
//       methods: ['GET', 'POST'],
//       allowedHeaders: ['Content-Type'],
//       credentials: false
//     })
//   );

// app.options('*', (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', 'https://kajeme-portfolio.vercel.app');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
//     res.status(200).end();
//   });
  
//   app.use(cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = [
//         'https://kajeme-portfolio.vercel.app',
//         'http://localhost:3002'
//       ];
  
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(null, 'https://default-allowed-origin.com'); 
//       }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     credentials: true
//   }));

app.use(helmet());


app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://vercel.live/"],
        connectSrc: ["'self'", "https://kajeme-portfolio.vercel.app", "http://localhost:3002"],
      },
    })
  );

app.get('/favicon.ico', (req, res) => res.status(204).end());
// app.use((req, res, next) => {
//     res.setHeader(
//         "Content-Security-Policy",
//         "default-src 'self'; connect-src 'self' https://kajeme-portfolio.vercel.app; script-src 'self' https://vercel.live; style-src 'self'; frame-ancestors 'self' https://vercel.live;"
//     );
//     next();
// });



app.use("/", router);


const contactEmail = nodemailer.createTransport({
    
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


contactEmail.verify((error) => {
    if(error){
        console.log(error);
    }else{
        console.log("ready to send");
    }
});


router.get("/", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send('Content security policy set!');
});
router.post("/contact", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Methods', 'POST'); 
    res.setHeader('Access-Control-Allow-Origin', 'https://kajeme-portfolio.vercel.app');
    const name = req.body.firstName + req.body.lastName;
    const email = req.body.email;
    const message = req.body.message;
    const phone = req.body.phone;
    const mail = {
        from: name,
        to: process.env.EMAIL_USER,
        subject: "Contact Submission - Portfolio",
        html: `<p>Name: ${name}</p>
                <p>Email: ${email}</p>
                <p>Phone: ${phone}</p>
                <p>Message: ${message}</p>`
        };
    contactEmail.sendMail(mail, (error) => {
    if(error){
        res.json(error);
    }else{
        res.json({ code: 200, status: "Message Sent"})
    }
  });
});

app.listen(port, () => console.log("Server Running"));