const { Order } = require("../models/orders")

module.exports={

    
orderPage:(userId)=>{

    return new Promise(async(reslove,reject)=>{
        try{
        let orders=await Order.find()
        reslove(orders)
        }catch(err){
        reject(err)
        }
    })

}

}