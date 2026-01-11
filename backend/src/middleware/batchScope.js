/**
 * Batch Scope Middleware
 * Restricts admin access to students from their assigned batch year only
 */

/**
 * Apply batch scope filtering to student queries
 * If user has batchScope set, adds filter to only show students from that batch
 * Superadmins and users without batchScope see all students
 */
exports.applyBatchScope = (req, res, next) => {
    const user = req.user

    // Superadmin sees everything
    if (user.roles.includes('superadmin')) {
        req.batchFilter = {}
        return next()
    }

    // User has batch scope - restrict to that batch only
    if (user.batchScope) {
        req.batchFilter = { batchYear: user.batchScope }
        req.isBatchScoped = true
        return next()
    }

    // No batch scope - see everything (for backward compatibility)
    req.batchFilter = {}
    next()
}

/**
 * Validate that batch-scoped admin can only create/update students in their batch
 */
exports.validateBatchScope = (req, res, next) => {
    const user = req.user

    // Superadmin can do anything
    if (user.roles.includes('superadmin')) {
        return next()
    }

    // User has batch scope - validate batch year
    if (user.batchScope) {
        const batchYear = req.body.batchYear

        if (batchYear && batchYear !== user.batchScope) {
            return res.status(403).json({
                error: {
                    message: `Access denied. You can only manage students from batch ${user.batchScope}`,
                    code: 'BATCH_SCOPE_VIOLATION'
                }
            })
        }
    }

    next()
}
