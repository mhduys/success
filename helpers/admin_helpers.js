var db=require('../config/connection')
var collections=require('../config/collections')


module.exports={
    
    adminLogin:(adminData)=>{
        
        //console.log(adminData);
        return new Promise(async(resolve,reject)=>{
            
            let response={}
           // let data=await db.get().collection(collections.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            //let password=await db.get().collection(collections.ADMIN_COLLECTION).findOne({password:adminData.password})
            //console.log(data,"adminData");
           

                if(process.env.EMAIL==adminData.Email){
                    if(process.env.PASSWORD==adminData.Password){ 
    
                        console.log("true");
                        
                        response.status=true
                        resolve(response )
                    }else{
                        resolve({dataError:true}) 
                    }
                 
    
                    
                }else{
                    console.log("false"); 
                    response.status=false
                    resolve({dataError:true})
                }
            
        })
    }
}