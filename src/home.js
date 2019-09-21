var company = document.getElementById("company");
var user = document.getElementById("user");
company.addEventListener("click", redirect);
user.addEventListener("click", userRedirect);
function redirect() {
  location.assign("../pages/company.html");
}

function userRedirect() {
  location.assign("../pages/user.html");
}
