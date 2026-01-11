// Permission checking utility
export const hasPermission = (user, permission) => {
    if (!user) return false

    // Superadmins have all permissions
    if (user.roles?.includes('superadmin')) return true

    // Check if user has the specific permission
    return user.permissions?.includes(permission) || false
}

export const hasAnyPermission = (user, permissions) => {
    if (!user) return false
    if (user.roles?.includes('superadmin')) return true

    return permissions.some(permission => user.permissions?.includes(permission))
}

export const hasAllPermissions = (user, permissions) => {
    if (!user) return false
    if (user.roles?.includes('superadmin')) return true

    return permissions.every(permission => user.permissions?.includes(permission))
}

export const isSuperAdmin = (user) => {
    return user?.roles?.includes('superadmin') || false
}

export const isAdmin = (user) => {
    return user?.roles?.includes('admin') || user?.roles?.includes('superadmin') || false
}

export const isRegularUser = (user) => {
    return user?.roles?.includes('user') && !isAdmin(user)
}

// Permission constants
export const PERMISSIONS = {
    VIEW_STUDENTS: 'view_students',
    ADD_STUDENTS: 'add_students',
    EDIT_STUDENTS: 'edit_students',
    DELETE_STUDENTS: 'delete_students',
    VIEW_BIRTHDAYS: 'view_birthdays',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_USERS: 'manage_users',
    SYSTEM_SETTINGS: 'system_settings',
    BULK_IMPORT: 'bulk_import',
    BULK_UPDATE: 'bulk_update'
}
