import Role from "../models/Role.js";
import { ROLE_NUMBER } from "../constants/constants.js";

export const generalAuth = async (req, res, next) => {
  try {
    const user = req.user;
    const role = await Role.findById(user.roleId);
    if (
      role.roleNumber === ROLE_NUMBER.admin ||
      role.roleNumber === ROLE_NUMBER.staff
    ) {
      next();
    } else {
      return res.status(403).json({
        message: "Bạn không có quyền để thực hiện hành động này!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    const user = req.user;
    const role = await Role.findById(user.roleId);
    if (!role || (role && role.roleNumber !== ROLE_NUMBER.admin)) {
      return res.status(403).json({
        message: "Bạn phải có quyền Admin để thực hiện hành động này!",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};
