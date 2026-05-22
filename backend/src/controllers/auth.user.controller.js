import { ApiResponse } from '../utils/api.res.js'
import { asyncHandler } from '../utils/asynchandlar.js'
import { sendOtpService, verifyOtpService, registerService, loginService, refreshTokenService, getMeService} from '../services/auth.user.service.js'

export const otpSend = asyncHandler(async function (req, res) {
    const { email } = req.body

    const { user, otpExpires } = await sendOtpService(email)

    return res.status(201).json(new ApiResponse(201, { user, otpExpires }, "OTP send successfully"))
})

export const otpVerify = asyncHandler(async function (req, res) {
    const { otp, email } = req.body

    const registrationToken = await verifyOtpService(email, otp)

    return res.status(201).json(new ApiResponse(201, registrationToken, "Account verified!"))
})

export const register = asyncHandler(async function (req, res) {
    const { firstname, lastname, password, registrationToken } = req.body

    const user = await registerService(firstname, lastname, password, registrationToken)

    return res.status(201).json(new ApiResponse(201, user, "User registerd successfully"))
})

export const login = asyncHandler(async function (req, res) {
    const { email, password } = req.body

    const { accessToken, refreshToken, user } = await loginService(email, password)

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(201).json(new ApiResponse(201, { accessToken, user }, "User logged-in successfully"))
})

export const refreshToken = asyncHandler(function (req, res) {
    const incomingRefrshToken = req.cookies.refreshToken

    const { accessToken } = refreshTokenService(incomingRefrshToken)

    return res.status(200).json(new ApiResponse(200, { accessToken: accessToken }, "User Get a new access token "))
})

export const getMe = asyncHandler(async function (req, res) {
    const id = req.user.id

    const user = await getMeService(id)

    return res.status(201).json(new ApiResponse(201, user, "User get successfully"))
})

// Google Auth API  >> In Future
// Logout-API    >> when create dashbord and room Than will  create