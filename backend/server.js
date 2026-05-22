import app from './src/app.js'
import config from './src/config/config.js'
import dbconnect from './src/config/database.js'

dbconnect()

app.listen(config.PORT,()=>{
    console.log("Server is Running  Port",config.PORT)
})