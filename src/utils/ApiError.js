class ApiError extends Error{
    constructor(
        statusCode,
        message='Something went wrong',
        errors=[],
        stack=""
        )
        {
            super(message);   //???    super is used to call the constructor of the parent class (Error in this case).
            // By doing super(message), you are invoking the constructor of the Error class, passing the message argument to set up the error message.
            this.statusCode=statusCode;
            this.data=null //Assignment
            this.message=message
            this.success=false
            this.errors=errors

            if (stack){ //The code block you provided is responsible for handling the stack property of the custom ApiError class.
                this.stack=stack
            }
            else{
                Error.captureStackTrace(this,this.constructor);
            }

        }
}
export {ApiError}