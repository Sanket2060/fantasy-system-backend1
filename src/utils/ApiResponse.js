class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 500; //?? boolean code if(statusCode<400){true} else {false}
  }
}

export { ApiResponse };
