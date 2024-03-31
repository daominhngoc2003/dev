import * as Yup from "yup";

export const roleSchema = Yup.object().shape({
  name: Yup.string()
    .required("Tên Vai trò không được để trống!")
    .max(50, "Tên Vai trò không được vượt quá 50 ký tự!"),
  roleNumber: Yup.number()
    .typeError("Số kí hiệu Vai trò phải là một số!")
    .required("Số kí hiệu Vai trò không được để trống")
    .integer("Số kí hiệu Vai trò phải là số nguyên!")
    .min(0, "Số kí hiệu Vai trò phải lớn hơn hoặc bằng 0!")
    .max(2, "Số kí hiệu Vai trò phải nhỏ hơn hoặc bằng 2!"),
  status: Yup.number()
    .typeError("Trạng thái Vai trò phải là một số!")
    .required("Trạng thái Vai trò không được để trống!")
    .integer("Trạng thái Vai trò phải là số nguyên!")
    .min(0, "Trạng thái Vai trò phải lớn hơn hoặc bằng 0!")
    .max(1, "Trạng thái Vai trò phải nhỏ hơn hoặc bằng 1!"),
});
