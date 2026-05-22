// hame error ko pakden  kai liye bar bar try catch and next ko haar folde rnahi likna padgea
const asyncHandler = (func)=> async(req,res,next) => {

    try{
        await func(req,res,next)
    }catch(error){
        next(error)
    }
}

export {asyncHandler}