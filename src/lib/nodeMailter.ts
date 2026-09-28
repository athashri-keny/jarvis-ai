import nodemailer from "nodemailer";

const transpoter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
     port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

export default transpoter