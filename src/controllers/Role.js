import { ROLE_NUMBER, ROLE_STRING } from "../constants/constants.js";
import errorValidate from "../helpers/errorValidate.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { roleSchema } from "../schemas/Role.js";

export const createRole = async (req, res) => {
  try {
    await roleSchema.validate(req.body, { abortEarly: false });

    const roleNameLowerCase = req.body.name.trim().toLowerCase();

    const existingRole = await Role.findOne({
      name: { $regex: new RegExp("^" + roleNameLowerCase + "$", "i") },
    });
    if (existingRole) {
      return res.status(400).json({
        message: "Tên Vai trò đã tồn tại trong cơ sở dữ liệu!",
      });
    }

    const role = await Role.create(req.body);
    return res.status(200).json({
      message: "Thêm Vai trò thành công!",
      data: role,
    });
  } catch (error) {
    errorValidate(error, res);
  }
};

export const updateRole = async (req, res) => {
  const { id } = req.params;
  try {
    await roleSchema.validate(req.body, { abortEarly: false });

    const existingRole = await Role.findById(id);
    const existingRoleName = await Role.findOne({
      name: req.body.name,
      _id: { $ne: id },
    });

    if (
      existingRole.name == ROLE_STRING.admin &&
      existingRole.roleNumber == ROLE_NUMBER.admin
    ) {
      return res.status(400).json({
        message:
          "Admin là chức danh cao nhất của hệ thống. Không thể chỉnh sửa!",
      });
    } else if (existingRoleName) {
      return res.status(400).json({
        message: "Tên Vai trò này đã tồn tại!",
      });
    }

    Object.assign(existingRole, req.body);
    const roleUpdated = await existingRole.save();

    if (!roleUpdated) {
      return res.status(400).json({
        message: "Lỗi cập nhật vai trò!",
      });
    }
    return res.status(200).json({
      message: "Cập nhật vai trò thành công!",
      data: roleUpdated,
    });
  } catch (error) {
    errorValidate(error, res);
  }
};

export const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const roleToBeDeleted = await Role.findById(id);
    if (!roleToBeDeleted) {
      return res.status(404).json({
        message: "Không tìm thấy Vai trò cần xóa!",
      });
    }
    if (
      roleToBeDeleted &&
      roleToBeDeleted.name &&
      roleToBeDeleted.name == ROLE_STRING.admin &&
      roleToBeDeleted.roleNumber == ROLE_NUMBER.admin
    ) {
      return res.status(400).json({
        message:
          "Vai trò Admin là chức danh cao nhất của hệ thống. Không thể xóa!",
      });
    }

    const noRoleYet = await Role.findOne({ name: ROLE_STRING.noRoleYet });
    const userIdsToBeMoved = roleToBeDeleted.users;

    if (noRoleYet) {
      await User.updateMany(
        { roleId: id },
        { roleId: noRoleYet._id, roleNumber: noRoleYet.roleNumber }
      );
      await Role.updateOne(
        { _id: noRoleYet._id },
        {
          $push: { users: { $each: userIdsToBeMoved } },
        }
      );
    } else {
      const newNoRoleYet = await Role.create({
        name: ROLE_STRING.noRoleYet,
        status: 0,
        roleNumber: 0,
        users: [],
      });
      await User.updateMany(
        { roleId: id },
        { roleId: newNoRoleYet._id, roleNumber: noRoleYet.roleNumber }
      );
      await Role.updateOne(
        { _id: newNoRoleYet._id },
        {
          $push: { users: { $each: userIdsToBeMoved } },
        }
      );
    }

    await Role.deleteOne({ _id: roleToBeDeleted._id });
    return res.status(200).json({
      message: "Xóa Vai trò thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};

export const getAllRole = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _search,
  } = req.query;

  const options = {
    page: _page,
    limit: _limit,
    sort: {
      [_sort]: _order === "desc" ? -1 : 1,
    },
  };
  try {
    let query = {};

    const searchRegex = new RegExp(_search, "i");
    if (_search && _search.trim() !== "") {
      query.$or = [{ name: { $regex: searchRegex } }];
    }

    const roles = await Role.paginate(query, options);
    if (roles.length === 0 && roles.length.docs === 0) {
      return res.status(400).json({
        message: "Danh sách vai trò trống!",
      });
    }
    return res.status(200).json({
      message: "Lấy danh sách Vai trò thành công!",
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};

export const getOneRole = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findById(id).populate({
      path: "users.userId",
      select: "fullname username phone",
    });
    if (!role) {
      return res.status(400).json({
        message: "Vai trò không tồn tại!",
      });
    }
    return res.status(200).json({
      message: "Lấy dữ liệu Vai trò thành công!",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};
