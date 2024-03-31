import * as Yup from "yup";

export const userSchema = Yup.object().shape({
  fullname: Yup.string()
    .required("Họ tên không được để trống!")
    .max(50, "Họ tên không được vượt quá 50 ký tự!"),
  username: Yup.string()
    .required("Tên đăng nhập không được để trống!")
    .max(25, "Tên đăng nhập không được vượt quá 25 ký tự!")
    .matches(
      /^[a-z0-9]+$/,
      "Tên đăng nhập chỉ được chứa các ký tự viết thường từ a-z và số từ 0-9, không có dấu cách!"
    )
    .test(
      "is-lowercase",
      "Tên đăng nhập phải viết thường (KHÔNG IN HOA)!",
      (value) => value === value.toLowerCase()
    ),
  password: Yup.string()
    .required("Mật khẩu không được để trống!")
    .max(15, "Mật khẩu không được vượt quá 15 ký tự!"),
  phone: Yup.string()
    .required("Số điện thoại không được để trống!")
    .matches(
      /^[0-9]{10,11}$/,
      "Số điện thoại phải chứa từ 10 đến 11 số và không được chứa các kí tự không phải là số nguyên!"
    ),
  avatar: Yup.mixed().nullable().default(null),
  roleId: Yup.string().required("Mã Vai trò không được để trống!"),
  roleNumber: Yup.number()
    .typeError("Số kí hiệu Vai trò phải là một số!")
    .required("Số kí hiệu Vai trò không được để trống")
    .integer("Số kí hiệu Vai trò phải là số nguyên!")
    .min(0, "Số kí hiệu Vai trò phải lớn hơn hoặc bằng 0!")
    .max(2, "Số kí hiệu Vai trò phải nhỏ hơn hoặc bằng 2!"),
});

export const changePasswordSchema = Yup.object().shape({
  username: Yup.string().required("Tên đăng nhập không được để trống!"),
  password: Yup.string().required("Mật khẩu cũ không được để trống!"),
  newPassword: Yup.string()
    .required("Mật khẩu mới không được để trống!")
    .max(15, "Mật khẩu mới không được vượt quá 15 ký tự!"),
});
