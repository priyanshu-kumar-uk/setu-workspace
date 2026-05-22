import React from 'react'
import { authGetme } from '../features/auth/hooks/api.hooks'
import { Navigate, Outlet } from 'react-router-dom'

const PublicRoute = () => {
const {data,isError,isPending,isSuccess} = authGetme()

if(isPending){
    return <div className='loader'>Checking auth...</div>
}

if(isSuccess&&data?.data){
    return <Navigate to="/dashboard"/>  // user success have a token skip a outlet page
}

return <Outlet/> // if user dont have token will be send  from Outlet page (Login)

}

export default PublicRoute