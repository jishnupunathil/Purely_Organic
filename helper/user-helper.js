const cartModel = require("../models/addtocartModel")


module.exports={

    getCartCount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await cartModel.findOne({user:userId})
            if (cart) {
                count = cart?.products?.length || 0
            }
            resolve(count)
        })

    }

}