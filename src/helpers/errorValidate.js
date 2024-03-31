const errorValidate = (error, res) => {
  if (error.name === "ValidationError") {
    const errors = {};
    error.inner.forEach((err) => {
      if (!errors[err.path]) {
        errors[err.path] = [];
      }
      errors[err.path].push(err.message);
    });
    return res.status(400).json({ message: "Lỗi nhập dữ liệu!", errors });
  }
  return res.status(500).json({
    message: `Lỗi từ Server: , ${error.message}!!!`,
  });
};
export default errorValidate;
