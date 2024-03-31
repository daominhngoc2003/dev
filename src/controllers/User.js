import { ROLE_NUMBER, ROLE_STATUS } from "../constants/constants.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helpers/generateJWT.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { changePasswordSchema, userSchema } from "../schemas/User.js";
import errorValidate from "../helpers/errorValidate.js";

export const createUser = async (req, res) => {
  try {
    await userSchema.validate(req.body, { abortEarly: false });

    const [existingPhone, existingUsername, roleIsActive] = await Promise.all([
      User.findOne({ phone: req.body.phone }),
      User.findOne({ username: req.body.username }),
      Role.findById(req.body.roleId),
    ]);

    if (existingPhone) {
      return res.status(400).json({
        message: "Số điện thoại đã được đăng ký cho 1 tài khoản khác!",
      });
    }

    if (existingUsername) {
      return res.status(400).json({
        message: "Tên người dùng đã được đăng ký cho 1 tài khoản khác!",
      });
    }

    if (!roleIsActive) {
      return res.status(400).json({
        message: "Không tìm thấy Vai trò!",
      });
    } else if (roleIsActive.status !== ROLE_STATUS.active) {
      return res.status(400).json({
        message: "Vai trò này đã ngưng hoạt động. Vui lòng chọn vai trò khác!",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    await Role.findByIdAndUpdate(user.roleId, {
      $addToSet: { users: { userId: user._id } },
    });

    return res.status(200).json({
      message: "Thêm tài khoản mới thành công!",
      data: user,
    });
  } catch (error) {
    errorValidate(error, res);
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    await userSchema.validate(req.body, { abortEarly: false });

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!",
      });
    }

    const [existingPhone, existingUsername, oldRole, roleIsActive, allUser] =
      await Promise.all([
        User.findOne({
          phone: req.body.phone,
          _id: { $ne: id },
        }),
        User.findOne({
          username: req.body.username,
          _id: { $ne: id },
        }),
        Role.findById(user.roleId),
        Role.findById(req.body.roleId),
        User.find({}),
      ]);

    if (
      user.roleNumber === ROLE_NUMBER.admin &&
      req.body.roleNumber !== user.roleNumber
    ) {
      const isHasAnotherAdmin =
        allUser.length > 0 &&
        allUser.filter(
          (item) =>
            item.roleNumber === ROLE_NUMBER.admin &&
            item._id.toString() !== user._id.toString()
        );

      if (!isHasAnotherAdmin.length) {
        return res.status(400).json({
          message:
            "Bạn đang là Admin của hệ thống, vui lòng chuyển quyền Admin cho 1 tài khoản khác trước khi thay đổi thành quyền Nhân viên!",
        });
      }
    }

    if (existingPhone) {
      return res.status(400).json({
        message: "Số điện thoại đã được sử dụng cho 1 tài khoản khác!",
      });
    }

    if (existingUsername) {
      return res.status(400).json({
        message: "Tên người dùng đã được sử dụng cho 1 tài khoản khác!",
      });
    }

    if (!roleIsActive) {
      return res.status(400).json({
        message: "Không tìm thấy Vai trò!",
      });
    } else if (roleIsActive.status !== ROLE_STATUS.active) {
      return res.status(400).json({
        message: "Vai trò này đã ngưng hoạt động. Vui lòng chọn vai trò khác!",
      });
    }

    if (oldRole) {
      const userIndex = oldRole.users.findIndex(
        (item) => item.userId == user._id
      );
      if (userIndex !== -1) {
        oldRole.users.splice(userIndex, 1);
        await oldRole.save();
      }
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    Object.assign(user, { ...req.body, password: hashedPassword });
    const userUpdated = await user.save();

    if (!userUpdated) {
      return res.status(400).json({
        message: "Cập nhật thất bại!",
      });
    }

    if (roleIsActive && roleIsActive.users) {
      let userExists = false;
      for (const item of roleIsActive.users) {
        if (item.userId === userUpdated._id) {
          userExists = true;
          break;
        }
      }

      if (!userExists) {
        roleIsActive.users.push({ userId: userUpdated._id });
        await roleIsActive.save();
      }
    }

    return res.status(200).json({
      message: "Cập nhật thành công !",
      data: userUpdated,
    });
  } catch (error) {
    errorValidate(error, res);
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [user, allUser] = await Promise.all([
      User.findById(id),
      User.find({}),
    ]);

    if (!user) {
      return res.status(400).json({
        message: "Người dùng không tồn tại!",
      });
    }

    if (user.roleNumber === ROLE_NUMBER.admin) {
      const isHasAnotherAdmin =
        allUser.length > 0 &&
        allUser.filter(
          (item) =>
            item.roleNumber === ROLE_NUMBER.admin &&
            item._id.toString() !== user._id.toString()
        );

      if (!isHasAnotherAdmin.length) {
        return res.status(400).json({
          message:
            "Bạn đang là Admin của hệ thống, vui lòng chuyển quyền Admin cho 1 tài khoản khác trước khi xóa tài khoản!",
        });
      }
    }

    const roleUser = await Role.findById(user.roleId);
    console.log(">>roleUser:", roleUser);
    if (roleUser) {
      const userIndex = roleUser.users.findIndex(
        (item) => item.userId == user._id
      );

      if (userIndex !== -1) {
        console.log(">>userIndex:", userIndex);
        roleUser.users.splice(userIndex, 1);
        await roleUser.save();
      }
    }

    await User.deleteOne({ _id: id });
    return res.status(200).json({
      message: "Xoá Người dùng thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};

export const signIn = async (req, res) => {
  const { username, phone, password } = req.body;
  try {
    if (!username && !phone) {
      return res.status(400).json({
        message: "Vui lòng nhập Tên người dùng hoặc Số điện thoại đăng nhập!",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Vui lòng nhập Mật khẩu đăng nhập!",
      });
    }

    let user = "";
    if (username) {
      const userByUsername = await User.findOne({ username });

      if (!userByUsername) {
        return res.status(400).json({
          message: "Tên người dùng hoặc số điện thoại không đúng!",
        });
      } else {
        user = userByUsername;
      }
    }

    if (phone) {
      const userByPhone = await User.findOne({ phone });
      if (!userByPhone) {
        return res.status(400).json({
          message: "Tên người dùng hoặc số điện thoại không đúng!",
        });
      } else {
        user = userByPhone;
      }
    }

    if (user !== "") {
      if (user && user.roleNumber === ROLE_NUMBER.noRoleLYet) {
        return res.status(400).json({
          message:
            "Tài khoản của bạn hiện đang bị ngưng hoạt động. Vui lòng liên hệ Admin để cấp lại quyền truy cập.",
        });
      }

      const hashedPassword = await bcrypt.compare(password, user.password);
      if (!hashedPassword) {
        return res.status(400).json({
          message: "Mật khẩu đã nhập không đúng!",
        });
      }
      user.password = undefined;

      const authAccessToken = generateAccessToken({
        _id: user._id,
      });

      const autRefreshToken = generateRefreshToken({
        _id: user._id,
      });

      return res.status(200).json({
        message: "Đăng nhập thành công!",
        data: {
          user,
          authAccessToken,
          autRefreshToken,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};

export const changePassword = async (req, res) => {
  const { username, password, newPassword } = req.body;
  try {
    await changePasswordSchema.validate(req.body, { abortEarly: false });

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        message: `Tài khoản không tồn tại, vui lòng kiểm tra lại!`,
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: `Mật khẩu cũ không đúng!`,
      });
    }

    const sameOldPassword = await bcrypt.compare(newPassword, user.password);
    if (sameOldPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới không được trùng với mật khẩu cũ!",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    Object.assign(user, { ...req.body, password: hashedPassword });
    const userChangedPassword = await user.save();
    if (!userChangedPassword) {
      return res.status(400).json({
        message: "Đổi mật khẩu thất bại!",
      });
    }

    return res.status(200).json({
      message:
        "Đổi mật khẩu thành công! Vui lòng sử dụng Mật khẩu mới để đăng nhập lại!",
    });
  } catch (error) {
    errorValidate(error, res);
  }
};

export const getAllUser = async (req, res) => {
  try {
    const {
      _page = 1,
      _limit = 10,
      _sort = "createdAt",
      _order = "desc",
      _search,
    } = req.query;
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === "asc" ? 1 : -1,
      },
      populate: [{ path: "roleId", select: "name" }],
    };
    const query = {};
    const searchRegex = new RegExp(_search, "i");
    if (_search && _search.trim() !== "") {
      query.$or = [
        { fullname: { $regex: searchRegex } },
        { username: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
      ];
    }

    const users = await User.paginate(query, options);
    if (users.length === 0 && users.length.docs === 0) {
      return res.status(400).json({
        message: "Danh sách Người dùng trống!",
      });
    }
    return res.status(200).json({
      message: "Lấy danh sách Người dùng thành công!",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};

export const getOneUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate({
      path: "roleId",
      select: "name",
    });
    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!",
      });
    }
    return res.json({
      message: "Lấy thông tin Người dùng thành công!",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Lỗi từ Server: , ${error.message}!!!`,
    });
  }
};
