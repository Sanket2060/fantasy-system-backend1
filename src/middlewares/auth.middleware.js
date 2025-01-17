import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"; //???
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
    //Authorization: Bearer token
    //Mobile apps don't have cookies so getting accessToken from req.header but the data is in upper form.
    //But we don't want Bearer but just token so replacing Bearer to "" empty string so that we get token only
    const cleanToken = token.trim();
    if (!token) {
      throw new ApiError(401, "Unauthorized request"); //??401 as unauthorized error???
    }

    //decrypt the token
    const decodedToken = jwt.verify(
      cleanToken,
      process.env.ACCESS_TOKEN_SECRET
    ); //the decoded token has all data sent during encoding of token
    //find user from token on database to verify
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    //_id was given when token  was made(encryption happened)
    if (!user) {
      throw new ApiError(401, "Invalid access token"); //??401 as unauthorized error???
    }
    req.user = user; //req object gets user property by this middleware
    next();
  } catch (error) {
    throw new ApiError(500, "Can't validate from access token at the moment");
    // throw new ApiError(500, "Invalid accessToken,relogin please");
  }
});
// Middleware to check if the user has admin role
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send({ error: "Access denied. Admins only." });
  }
  next();
};
