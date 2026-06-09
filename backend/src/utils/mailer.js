import config from '../config/config.js';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    auth: {
        user: config.APP_EMAIL,
        pass: config.APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000 
});   