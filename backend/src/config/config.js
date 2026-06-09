import dotenv from 'dotenv'
 dotenv.config()
 const requiredEnv = ['PORT','MONGO_URI','APP_PASSWORD','APP_EMAIL','TOKEN','MISTRAL_API_KEY']
 requiredEnv.forEach((key)=>{
    if(!process.env[key]){
          return console.log("Env key is missing : ",{key})
    }
 })
 const config = {
    PORT : process.env.PORT,
    MONGO_URI : process.env.MONGO_URI ,
    APP_PASSWORD : process.env.APP_PASSWORD,
    APP_EMAIL : process.env.APP_EMAIL,
    TOKEN : process.env.TOKEN,
    MISTRAL_API_KEY : process.env.MISTRAL_API_KEY,
    TAVILY_API_KEY : process.env.TAVILY_API_KEY,
    FRONTEND_URL : process.env.FRONTEND_URL,
    BREVO_API_KEY : process.env.BREVO_API_KEY
}
export default config