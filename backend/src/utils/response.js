/**
 * Standard API Response Envelope
 */

const successResponse = (res, data, meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
};

const paginatedResponse = (res, data, total, page, limit, meta = {}) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
};

module.exports = {
  successResponse,
  paginatedResponse
};
