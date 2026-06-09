import axios from 'axios'
import api from '../../axiosInstance'
const baseURL = import.meta.env.VITE_API_URL || "/api";

export async function otpSendApi({ email }) {
    try {
        let res = await axios.post(`${baseURL}/auth/otpsend`, { email });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export async function otpVerifyApi({ otp, email }) {
    try {
        let res = await axios.post(`${baseURL}/auth/otpVerify`, { otp, email });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export async function profileRegisterApi({ firstname, lastname, password, registrationToken }) {
    try {
        let res = await axios.post(`${baseURL}/auth/register`, {
            firstname,
            lastname,
            password,
            registrationToken
        }, {
            withCredentials: true 
        }); 
        return res.data;
    } catch (err) {
        throw err;
    }
}
export async function loginApi({ email, password }) {
    try {
        let res = await api.post('/auth/login', { email, password })
        return res.data
    } catch (err) {
        throw err
    }
}
export async function getMeApi() {
    try {
        let res = await api.get('/auth/getMe', { withCredentials: true })
        return res.data
    } catch (err) {
        throw err
    }
}
