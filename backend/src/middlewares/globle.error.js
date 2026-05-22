import { ApiError } from "../utils/api.error.js";

function globleError(err, req, res, next) {

    // ApiError uses .status (not .statusCode) — check both
    const statusCode = err.status || err.statusCode || 500;

    if (err instanceof ApiError) {
        return res.status(statusCode).json({
            success: false,
            message: err.message,
            data: err.data || null,
        });
    }

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
}

export default globleError