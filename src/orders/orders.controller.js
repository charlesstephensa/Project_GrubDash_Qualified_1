const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//List all orders in database
function list (req,res,next){
  res.json({data: orders});
}

//reads data from the corresponding order.
function read(req,res){
  res.json({data:res.locals.order})
}

//Create new order from body information with new Id
function create(req,res,next){
  const body = req.body;

const newOrder = {
    id: nextId(),
    deliverTo: body.data.deliverTo,
    mobileNumer: body.data.mobileNumber,
    dishes: body.data.dishes,
};
orders.push(newOrder);
res.status(201).json({data:newOrder});
}

function update(req,res,next){
  const body = req.body;
  const {orderId} = req.params;

  if(!body.data.id){
  res.locals.order = {deliverTo: res.locals.order.deliverTo,
                     mobileNumber: res.locals.order.mobileNumber,
                     id: orderId,
                     status: res.locals.order.status,
                     dishes: res.locals.order.dishes};
          
            res.json({data: res.locals.order});
        } else if(body.data.id == res.locals.order.id){
    res.locals.order = body.data
    res.json({data: res.locals.order})
    } 
        
        return next({status: 400, message: `Order id does not match route id. Order: ${body.data.id}, Route: ${res.locals.order.id}`})
    }
//removes order from the database.
function destroy(req,res){
    //const {orderId} = req.params;
    const index = orders.findIndex((order)=> res.locals.order.id == Number(order.id));
    if(index > -1){
     orders.splice(index, 1);
    }
  
    res.sendStatus(204);
    
    
}

function isPending(req,res,next){
  if(res.locals.order.status){
    if(res.locals.order.status !== "pending"){
      next({status:400, message:"An order cannot be deleted unless it is pending"})
    } else {
      next();
    }

  }
      next({status:400, message:"An order cannot be deleted unless it is pending"})
}
//Checks if OrderID exists in the database
function isValid(req,res,next){
    const {orderId} = req.params;
    const foundOrder = orders.find((order) => order.id == orderId);
 
    if (!foundOrder) {
       next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
    } else {

      res.locals.order = foundOrder;
      next();
    }
}


//Checks is request body has the necessary fields.
function isBodyValid(req,res,next){
const body = req.body.data;

if (body.deliverTo){
    if (body.mobileNumber){
        return next();
    }
    next({status:400,message:`Order must include a mobileNumber`});
}
next({status:400, message: `Order must include a deliverTo`});
}


//Verifies if List of dishes contains at least one dish with a quantity of at least one.
function hasDishes(req,res,next){
    const dishList = req.body.data.dishes;
      if(dishList){
         if(!Array.isArray(dishList)){
          next({status:400, message: `Order must include at least one dish`});
          } else if(dishList.length === 0){
             next({status:400, message: `Order must include at least one dish`});
          } else {
           dishList.forEach((dish, index)=>{
              if(!(dish.quantity)|| typeof dish.quantity != 'number'){
                next({status:400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
              } else if(dish.quantity <= 0){
                         next({status:400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
              }
            });
          }
    return next(); 
}
  next({status:400, message: `Order must include at least one dish`});

}
//Checks if order matches the route orderId.
function hasId(req,res,next){
  const body = req.body.data;
  const {orderId} = req.params;
  if(body.id){
    if(body.id === orderId){
      next();
    }
    next({status:400, message: `Order id does not match route id. Order: ${body.id}, Route: ${orderId}.`});
  }
next();
}


//Checks is request body has a status and throws errors if status is not valid.
function hasStatus(req,res, next){
  const body = req.body.data;
  
  if(body.status){
    if(body.status === 'delivered'){
      next({status: 400, message: `A delivered order cannot be changed`});
    } else{
      if(body.status == "pending"){
         next();
         }
      
      if(body.status =="preparing"){
         next();
         }
            
      if(body.status =="out-for-delivery"){
         next();
         }
      next({status:400,message:'Order must have a status of pending, preparing, out-for-delivery, delivered'});
    }
    next();
  }
next({status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered`});
  }



//Export functions

module.exports = {
list,
delete:[isValid, isPending, destroy],
create: [isBodyValid, hasDishes, create],
read: [isValid, read],
update:[isValid, isBodyValid, hasDishes, hasStatus, hasId, update] 
}