import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Register.css';
import {authOtpSend, authOtpVerify} from '../hooks/api.hooks.js'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'

const Register = () => {
const { register, handleSubmit, setError, formState: { errors }, setValue, getValues, clearErrors } = useForm();
const [email, setEmail] = useState("");
const [remaintime, setRemaintime] = useState(0);
const [timemessage, setTimemessage] = useState("");
const [otpFields, setOtpFields] = useState(["", "", "", "", "", ""]);
const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

const minutes = Math.floor(remaintime / 60);
const seconds = remaintime % 60;
const formattedDisplayTime = remaintime > 0 
  ? `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s` 
  : "";
 
const sendOtpMutation = authOtpSend()
const verifyOtpMutation = authOtpVerify()

const navigate = useNavigate()
// Countdown timer effect with mutation reset and UI fallback
useEffect(() => {
  let interval;
  if (remaintime > 0) {
    interval = setInterval(() => {
      setRemaintime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          sendOtpMutation.reset(); // Pehle wala form wapas aa jayega
          setOtpFields(["", "", "", "", "", ""]); // OTP clear
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  return () => {
    if (interval) clearInterval(interval);
  };
}, [remaintime, sendOtpMutation]);

function otpSubmit(data) {
  setEmail(data.email);
  if (!sendOtpMutation.isSuccess) {
    sendOtpMutation.mutate(data, {
      onSuccess: (response) => {
        if (response?.data?.otpExpires) {
          const expiryTime = Number(response.data.otpExpires);
          const currentTime = Date.now();
          const diffInSeconds = Math.floor((expiryTime - currentTime) / 1000);

         if (diffInSeconds > 0) {
         setRemaintime(diffInSeconds);
       }

        }
        if (response?.message) console.log(response.message);
      },
      
      onError: (error) => {
        const serverError = error.response?.data;
        if (!serverError) return;

        if (error.response.status === 429 && serverError.data) {
          const rTime = Number(serverError.data.remainingTime);
          setRemaintime(rTime);
        } 
        else {
          setError("email", {
            type: 'server',
            message: serverError.message
          });
        }
      }
    });
  } else {
    const otp = otpFields.join("");
    if (otp.length < 6) {
      setError("otp", { type: 'manual', message: "Please enter all 6 digits" });
      return;
    }
    verifyOtpMutation.mutate({
      otp,
      email: email
    }, {
      onSuccess: (response) => { 
        const token = response?.data
        sessionStorage.setItem('reg-token',token)   // in the future first replace here handle with backend this 
         navigate("/register-profile",{state:{registerToken:token}})
      },
      onError: (error) => {
        setError("otp", {
          type: 'server', 
          message: error.response?.data?.message || "Invalid OTP"
        });
      }
    });
  }
}

const handleOtpChange = (e, idx) => {
  const val = e.target.value.replace(/\D/g, "");
  if (val.length > 1) return;
  const newOtp = [...otpFields];
  newOtp[idx] = val;
  setOtpFields(newOtp);
  setValue(`otp${idx + 1}`, val);
  if (val && idx < 5) {
    otpRefs.current[idx + 1].current.focus();
  }
  if (!val) {
    clearErrors("otp");
  }
};

const handleOtpKeyDown = (e, idx) => {
  if (e.key === "Backspace") {
    if (otpFields[idx] === "" && idx > 0) {
      otpRefs.current[idx - 1].current.focus();
    }
  } else if (e.key === "ArrowLeft" && idx > 0) {
    otpRefs.current[idx - 1].current.focus();
  } else if (e.key === "ArrowRight" && idx < 5) {
    otpRefs.current[idx + 1].current.focus();
  }
};
  return (
    <div className="register-page">
      <nav className="register-navbar">
        <Link to="/" className="register-navbar-brand"  disabled={verifyOtpMutation.isSuccess}>
          SETU
        </Link>
        <div className="register-navbar-right">
          <span className="register-navbar-text">Already have an account?</span>
          <a href="/login" className="register-signin-link"  >Sign In</a>
        </div>
      </nav>

      <div className="register-content">
        <div className="register-left-section">
          <div className="isometric-illustration">
            <div className="isometric-content">
              <div className="meeting-room-box">
                <span className="meeting-room-icon">🎥</span>
              </div>
              <div className="illustration-text">
                <h3>Connect & Collaborate</h3>
                <p>Join your team in seamless video meetings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="register-right-section">
          <form className="register-form" onSubmit={handleSubmit(otpSubmit)}>
            {formattedDisplayTime && (
              <div className="countdown-timer">
                Retry in: {formattedDisplayTime}
              </div>
            )}

            <h1 className="register-heading">Verify your Account</h1>
            <p className="register-subtext">
               Setu for seamless collaboration
            </p>
              
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input${errors?.email ? ' input-error' : ''}`}
                placeholder="name@gmail.com"
                disabled={sendOtpMutation.isSuccess || remaintime > 0}
                {...register("email",{
                  required: "Email is required",
                  pattern:{
                    value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|co|io)$/i,
                    message: "Enter a valid email"
                  }
                })}
              />
              {errors?.email && (<p className="error-text">{errors.email.message}</p>)}
            {!sendOtpMutation.isSuccess && (
                <button type="submit" className="btn-send-otp" disabled={sendOtpMutation.isPending || remaintime > 0}>
                  SEND OTP
              </button>
            )}
            </div>
                   
            {sendOtpMutation.isSuccess && (
              <div className="otp-section">
                <label className="otp-title">Enter 6-digit OTP</label>
                <div className="otp-boxes-container">
                  {otpFields.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      disabled={verifyOtpMutation.isSuccess}
                      inputMode="numeric"
                      maxLength={1}
                      autoComplete="one-time-code"
                      className={`otp-box${(errors.otp && (digit === "")) ? " input-error" : ""}`}
                      {...register(`otp${idx + 1}`, {
                        required: true,
                        validate: v => /^\d?$/.test(v)
                      })}
                      value={digit}
                      ref={otpRefs.current[idx]}
                      onChange={e => handleOtpChange(e, idx)}
                      onKeyDown={e => handleOtpKeyDown(e, idx)}
                      onFocus={e => e.target.select()}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="error-text">{errors.otp.message}</p>
                )}
                <button type="submit" className="btn-verify-otp" disabled={verifyOtpMutation.isSuccess}>
                  VERIFY OTP
                </button>
              </div>
            )}
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;