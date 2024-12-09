const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
const helmet = require("helmet");
require('dotenv').config();

const port = process.env.PORT || 3003;
const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json());


// const corsOptions = {
//     origin: 'http://localhost:3002/#contact', 
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['authorization', 'content-type']
//   };
// app.use(cors(corsOptions));

// app.use(cors()); 


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
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; connect-src 'self' https://kajeme-portfolio.vercel.app; script-src 'self' https://vercel.live; style-src 'self'; frame-ancestors 'self' https://vercel.live;"
    );
    next();
});



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
    // res.send('Content security policy set!');
    // res.json({"": ""});
    res.json({ code: 200, status: "Portfolio Server Running"})
    // console.log(req);
});
router.post("/contact", (req, res) => {
    console.log("POST REQ");
    console.log("AUTH HEADERS: " + req.headers['authorization']);
    console.log("AUTH HEADERS: " + req.headers['content-type']);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Methods', 'POST'); 
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3004');
    res.setHeader('Access-Control-Allow-Origin', process.env.PORTFOLIO_URL);
    
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