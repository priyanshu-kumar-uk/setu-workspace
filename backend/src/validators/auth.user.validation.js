import { body, validationResult } from 'express-validator'
import { ApiError } from '../utils/api.error.js'
export const validateRegister = (req, res, next) => {
    const errors = validationResult(req)  
    if(!errors.isEmpty()){
        let errormsg =  errors.array()
        return next (new ApiError(400,errormsg[0].msg))
    }
    next()
}
export let registerValidation = [
    body("firstname")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({min:2})
    .withMessage("First name must be at least 2 characters long")  
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name must contain only letters"),
    body("lastname")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({min:2})
    .withMessage("Last name must be at least 2 characters long")  
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name must contain only letters"),
    body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min:6,max:20})
    .withMessage("Password must be between 6 and 20 characters long")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character")
,validateRegister
]
