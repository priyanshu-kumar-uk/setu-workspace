import React from 'react'
import { authGetme } from '../features/auth/hooks/api.hooks.js'
import { Navigate, Outlet } from 'react-router-dom'
const ProtectedRoute = () => {
 const{data,isError,isPending} = authGetme()
 
//  in future we will do  isPending so show user a rotate circle his same page
 if(isPending){
  return <div className='loader'>checking...</div>
 }

 if(isError||!data){
  return <Navigate to= "/login" replace />
 }

 return <Outlet/>

}

export default ProtectedRoute