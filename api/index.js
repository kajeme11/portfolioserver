const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
const helmet = require("helmet");
require('dotenv').config();

// app.use(
//     cors({
//       origin: 'https://kajeme-portfolio.vercel.app',
//       methods: ['GET', 'POST'],
//       allowedHeaders: ['Content-Type'], // Add custom headers here
//     })
//   );

const port = process.env.PORT || 3000;
const app = express();

app.use(cors()); 
app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://vercel.live/"],
        connectSrc: ["'self'", "https://kajeme-portfolio.vercel.app"],
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

app.use(express.json());


app.use("/", router);
app.listen(port, () => console.log("Server Running"));

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
    res.send('Content security policy set!');
});
router.post("/contact", (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'POST'); 
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

