var { expressjwt: jwt } = require('express-jwt');
const { Token } = require('../models/token');
require('dotenv').config();
const env =  process.env;



const API = env.VERSION;
const SECRET = env.ACCESS_TOKEN_SECRET;


const AuthJwt = {
    expJwt : jwt({
        secret: SECRET,
        algorithms: ['HS256'],
        isRevoked: isRevoked,
      }).unless({
        path: [
          `${API}/sub-admin/registerAdmin`,
          `${API}/sub-admin/registerAdmin/`,

          `${API}/sub-admin/loginAdmin`,
          `${API}/sub-admin/loginAdmin/`,
        ],
      }),
};


async function isRevoked(req, jwt) {
  const authHeader = req.header('Authorization');
  if (!authHeader.startsWith('Bearer ')) {
    return true; // Missing or invalid authorization header
  }

  const accessToken = authHeader.replace('Bearer', '').trim();
  const token = await Token.findOne({ accessToken });

  const adminRegex = /^\/api\/v1\/admin\//i;
  const adminFault = !jwt.payload.isAdmin && adminRegex.test(req.originalUrl);

  return adminFault || !token; // Token is revoked if admin access is not allowed or token is not found
}



module.exports = AuthJwt;
