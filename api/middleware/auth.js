import jwt from "jsonwebtoken";
export const protectedRoute = (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.id };
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Forbidden" });
  }
}
