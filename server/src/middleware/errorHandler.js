export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // handle pg unique constraint violation
  if (err.code === "23505") {
    return res
      .status(409)
      .json({ error: "Duplicate entry. Record already exists." });
  }

  // handle pg foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist." });
  }

  // handle pg check constraint violation (e.g. negative stock)
  if (err.code === "23514") {
    return res
      .status(400)
      .json({ error: "Constraint violation. Check your input values." });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
};
