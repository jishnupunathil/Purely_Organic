const cartModel = require("../models/addtocartModel")
const userModel = require("../models/userModel")


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

      },

      getProfile: (userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            let profile = await userModel.findById(userId);
            if (profile) {
              resolve(profile);
            } else {
              // Return a default value or reject with an error message
              reject(new Error("User profile not found"));
            }
          } catch (err) {
            reject(err);
          }
        });
      },
      editProfile:(userId,data,picture)=>{
        console.log(picture);
        return new Promise(async(resolve,reject)=>{
          try{
            let updatedUser=await userModel.findByIdAndUpdate(userId,{
              firstname:data.firstname,
              lasttname:data.lastname,
              email:data.email,
              phoneNumber:data.phoneNumber,
              image:picture.image
            },{new:true})
            if(updatedUser){
              resolve(updatedUser)
            }else{
              reject(new Error(" profile cannot updated"));
            }
          }catch(err){
            reject(err)
          }
        })
      },

      placeOrder: async (
        userId,
        PaymentMethod,
        totalAmount,
        couponCode,
        address
      ) => {
        try {
          let id = address?.addressId;
    
          if (id) {
            const isAddressExist = await Address.findById(id);
    
            if (isAddressExist) {
              isAddressExist.full_name = address.name;
              isAddressExist.street_name = address.Streetaddress;
              isAddressExist.apartment_number = address.appartments;
              isAddressExist.city = address.city;
              isAddressExist.state = address.state;
              isAddressExist.postal_code = address.postalcode;
              isAddressExist.mobile_Number = address.mobileNumber;
    
              await isAddressExist.save();
            }
          }
          //create new  address
          else {
            const newAddress = new Address({
              user_id: userId,
              full_name: address.name,
              street_name: address.Streetaddress,
              apartment_number: address.appartments,
              city: address.city,
              state: address.state,
              postal_code: address.postalcode,
              mobile_Number: address.mobileNumber,
              default_address: true,
            });
    
            const response = await newAddress.save();
    
            id = response._id;
          }
    
          const cart = await Cart.findOne({ user: userId }).populate(
            "products.productId"
          );
    
          const cartItems = cart.products.map((item) => {
            const { productId, quantity } = item;
            const { _id, productName, productModel, productPrice, productImage } =
              productId;
            const totalPrice = productPrice * quantity;
            return {
              item: _id,
              quantity,
              totalPrice,
              product: {
                _id,
                productName,
                productModel,
                productPrice,
                productImage,
              },
            };
          });
    
          //extracting totalamount
          let subtotal = 0;
          if (isNaN(totalAmount)) {
            cartItems.forEach((item) => {
              subtotal += item.product.productPrice * item.quantity;
            });
          } else {
            subtotal = totalAmount;
            const coupon = await Coupon.findOne({ code: couponCode });
            if (coupon) {
              coupon.usedBy.push(userId);
              await coupon.save();
            }
          }
    
          // Create a new order
    
          let status = "";
          if (PaymentMethod === "cash_on_delivery") {
            status = "Placed";
          } else if (PaymentMethod === "wallet") {
            const user = await User.findById(userId);
    
            if (user.wallet >= subtotal) {
              user.wallet -= parseInt(subtotal);
              await user.save();
              status = "Placed";
              var paymentStatus = "paid";
            } else {
              status = "Payment Pending";
            }
          } else if (PaymentMethod == "online_payment") {
            status = "Payment Pending";
            const newOrder = new Order({
              user_id: userId,
              total_amount: subtotal,
              address: id,
              payment_method: PaymentMethod,
              payment_status: paymentStatus,
              order_status: status,
              items: [],
            });
    
            const orderedItems = await Promise.all(
              cartItems.map(async (item) => {
                const orderedItem = new OrderItem({
                  productName: item.product.productName,
                  product_id: item.product._id,
                  quantity: item.quantity,
                  unit_price: item.totalPrice,
                });
                await orderedItem.save();
                return orderedItem;
              })
            );
    
            newOrder.items = newOrder.items.concat(orderedItems);
    
            // Save the new order to the database
            const savedOrder = await newOrder.save();
            return savedOrder;
          }
    
          const newOrder = new Order({
            user_id: userId,
            total_amount: subtotal,
            address: id,
            payment_method: PaymentMethod,
            payment_status: paymentStatus,
            order_status: status,
            items: [],
          });
    
          const orderedItems = await Promise.all(
            cartItems.map(async (item) => {
              const orderedItem = new OrderItem({
                productName: item.product.productName,
                product_id: item.product._id,
                quantity: item.quantity,
                unit_price: item.totalPrice,
              });
              await orderedItem.save();
    
              // Update product quantity in product collection
              const product = await Product.findById(item.product._id);
              if (product) {
                // Subtract ordered quantity from product quantity
                product.productQuantity -= item.quantity;
                await product.save();
              }
    
              return orderedItem;
            })
          );
    
          newOrder.items = newOrder.items.concat(orderedItems);
    
          // Save the new order to the database
          const savedOrder = await newOrder.save();
    
          await Cart.deleteMany({ user: userId });
    
          return savedOrder;
        } catch (err) {
          console.error(err);
        }
      }

}