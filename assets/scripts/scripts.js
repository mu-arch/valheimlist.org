
function e(e) {
    return document.getElementById(e);
}

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        e("sidebar-content").style.position = "fixed";
    } else {
        e("sidebar-content").style.position = "static";
    }
});