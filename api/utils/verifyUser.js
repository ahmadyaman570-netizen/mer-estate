import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

const getCookieValue = (cookieHeader, cookieName) => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const cookie = cookies.find((item) => item.startsWith(`${cookieName}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
};

export const verifyUser = (req, res, next) => {
  const token = getCookieValue(req.headers.cookie, "access_token");

  if (!token) {
    return next(errorHandler(401, "Unauthorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return next(errorHandler(403, "Forbidden"));
    }

    if (!user?.id) {
      return next(errorHandler(403, "Forbidden"));
    }

    req.user = user;
    next();
  });
};
