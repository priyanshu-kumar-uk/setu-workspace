import userModel from '../models/auth.user.model.js'
import { ApiError } from '../utils/api.error.js'
import { transporter } from '../utils/mailer.js'
import config from '../config/config.js'
import argon2 from 'argon2'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
export const sendOtpService = async (email) => {
    const exitUser = await userModel.findOne({ email })
    if (exitUser && exitUser.isVerified === true) {
        throw new ApiError(400, "User already registered. Please login.");
    }
    if (exitUser && exitUser.otpExpiresAt && exitUser.otpExpiresAt > Date.now()) {  
        const remainingTime = Math.ceil((exitUser.otpExpiresAt - Date.now()) / 1000)
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const timeString = minutes > 0
            ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} seconds`
            : `${seconds} seconds`;
        throw new ApiError(429, ` OTP expire ${timeString}`, { remainingTime, formattedTime: timeString })
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 3 * 60 * 1000  
    const user = await userModel.findOneAndUpdate(   
        { email: email },
        {
            otpCode: otp,
            otpExpiresAt: otpExpires,
            isVerified: false,
            email: email            
        }, {
        upsert: true,   
        new: true,      
        setDefaultsOnInsert: true 
    })
    const mailoptions = {
        from: `"Setu Security" <${config.APP_EMAIL}>`, 
        to: email,
        subject: "Setu: Verification Code", 
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Setu Verification</title>
        <style>
            /* Premium Web App Style - Media Queries */
            @media screen and (max-width: 480px) {
                .container { padding: 20px 15px !important; }
                .otp-box { font-size: 32px !important; letter-spacing: 6px !important; padding: 15px !important; }
                .header-logo { font-size: 24px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table class="container" width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <tr>
                            <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #f3f4f6;">
                                <h1 class="header-logo" style="margin: 0; color: #111827; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Setu<span style="color: #2563eb;">.</span></h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 32px;">
                                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600;">Confirm your email address</h2>
                                <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                                    Welcome to Setu! To complete your setup and ensure your account's security, please enter the following verification code in your browser.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding-bottom: 32px;">
                                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; display: inline-block; min-width: 250px;">
                                    <div class="otp-box" style="color: #111827; font-size: 40px; font-weight: 700; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace;">
                                        ${otp}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                                    <span style="margin-right: 6px;">⏱️</span> This code will expire securely in 3 minutes.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 24px; border-top: 1px solid #f3f4f6;">
                                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; line-height: 20px;">
                                    If you did not request this email, there's nothing to worry about. You can safely ignore it.
                                </p>
                                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                    Need help? Reply to this email or contact <a href="mailto:support@setu.com" style="color: #2563eb; text-decoration: none;">support@setu.com</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                    <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; padding-top: 20px;">
                        <tr>
                            <td align="center">
                                <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px;">
                                    &copy; ${new Date().getFullYear()} Setu Inc. All rights reserved.<br>
                                    This is an automated message, please do not reply to this email directly unless seeking support.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
    };
    try {
        await transporter.sendMail(mailoptions)
    } catch (err) {
        throw new ApiError(401, "Failed to send OTP. Please check your email or try again later.")
    }
    return { user, otpExpires }
}
export const verifyOtpService = async (email, otp) => {
    const Otp = String(otp)
    let user = await userModel.findOne({ email })
    if (!user || user.otpCode !== Otp) {
        throw new ApiError(400, "Invalid OTP.")
    }
    if (Date.now() > user.otpExpiresAt) {
        throw new ApiError(400, "OTP has expired")
    }
    let registrationToken = jwt.sign(
        {
            email: email
        },
        config.TOKEN,
        {
            expiresIn: '10m'
        }
    )
    user.isVerified = true
    user.otpCode = undefined      
    user.otpExpiresAt = undefined
    user.expireAt = new Date(Date.now() + 10 * 60 * 1000) 
    await user.save()
    return registrationToken
}
export const registerService = async (firstname, lastname, password, registrationToken) => {
    if (!registrationToken) {
        throw new ApiError(401, "Unauthorized user")
    }
    const decoderUser = jwt.verify(registrationToken, config.TOKEN)
    const email = decoderUser.email
    const user = await userModel.findOne({ email })
    if (!user) {
        throw new ApiError(404, "Unauthorized user")
    }
    const hashPassword = await argon2.hash(password)
    user.firstname = firstname
    user.lastname = lastname
    user.password = hashPassword
    user.expireAt = undefined
    await user.save()
    const refreshToken = jwt.sign(
        {
            id: user._id
        }, config.TOKEN,
        {
            expiresIn: '7d'
        }
    )
    const accessToken = jwt.sign(
        {
            id: user._id
        }, config.TOKEN,
        {
            expiresIn: '20m'
        }
    )
    user.password = undefined
    return { accessToken, refreshToken, user }
}
export const loginService = async (email, password) => {
    const user = await userModel.findOne({ email }).select("+password")
    if (!user) {
        throw new ApiError(403, "user not found")
    }
    console.log(user.password)
    const isValid = await argon2.verify(user.password, password)
    if (!isValid) {
        throw new ApiError(403, "Please Enter a valid Password")
    }
    const refreshToken = jwt.sign(
        {
            id: user._id
        }, config.TOKEN,
        {
            expiresIn: '7d'
        }
    )
    const accessToken = jwt.sign(   
        {
            id: user._id
        }, config.TOKEN,
        {
            expiresIn: '20m'
        }
    )
    user.password = undefined  
    return { accessToken, refreshToken, user }
}
export const refreshTokenService = (incomingRefrshToken) => {
    if (!incomingRefrshToken) {
        throw new ApiError(401, "No refresh token found")
    }
    try {
        let decode = jwt.verify(incomingRefrshToken, config.TOKEN)
        const accessToken = jwt.sign(
            {
                id: decode.id
            }, config.TOKEN,
            {
                expiresIn: '20m'
            }
        )
        return { accessToken }
    } catch (err) {
        throw new ApiError(401, "Invaild refresh token")
    }
}
export const getMeService = async (id) => {
    const user = await userModel.findById(id)
    if (!user) {
        throw new ApiError(403, "user not found")
    }
    return user
}
export const logoutService = async (userId) => {
    const user = await userModel.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    user.refreshToken = undefined
    await user.save()
    return user
}