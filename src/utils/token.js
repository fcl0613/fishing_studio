
const TOKEN_KEY = 'YY_USER'
const USER_INFO = 'YY_USER_INFO_WEB'

export function setToken(token) { // 将token存入localStorage
    return localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {	//拿到localStorage中的token
    return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {  //退出登录时调用销毁token
    return localStorage.removeItem(TOKEN_KEY)
}

export function setYyUserInfo(userInfo) {
    console.log(userInfo)
    return localStorage.setItem(USER_INFO, JSON.stringify(userInfo))
}

export function getYyUserInfo() {
    return JSON.parse(localStorage.getItem(USER_INFO))
}