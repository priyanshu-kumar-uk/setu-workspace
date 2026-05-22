import React, { useEffect } from 'react'
import { replace, useLocation, useNavigate, useNavigation} from 'react-router-dom'
const ProfileGuard = ({children}) => {
const location =  useLocation()
const navigate = useNavigate()
const token = location.state?.registerToken || sessionStorage.getItem('reg-token')

const isTokenValid = (token)=>{
     if(!token) false
     
     try{
     const paylode = JSON.parse(atob(token.split('.')[1])); // Token inside get a data 
     const currentTime = Math.floor(Date.now()/1000)
     return paylode.exp>currentTime
     } catch(err){
        return false
     }
}

 useEffect(()=>{
    
 if(!isTokenValid(token)){
    sessionStorage.removeItem('reg-token')
    navigate("/register",{replace:true})
 }
 },[token,navigate])
 return children

}

export default ProfileGuard