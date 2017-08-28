var mongoose=require('mongoose');

var connect=function(){
	mongoose.connect('mongodb://127.0.0.1:27017/db',function (error) {
	    if(error){console.log("error");}
	    else{
	    	
	        console.log("connected!!");
	    	
	    }



	});
	
};


module.exports=connect;

