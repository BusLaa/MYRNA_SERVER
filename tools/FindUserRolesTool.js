const isRolesInUser = (userRoles, roles) => {
    userRoles =  userRoles.map ((role) => role.name)
    for (let role of roles){
        if (userRoles.indexOf(role) === -1){return false}
    }
    return true
}

module.exports = {isRolesInUser}