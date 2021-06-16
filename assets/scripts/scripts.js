
function e(e) {
    return document.getElementById(e);
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}



function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

let serverAddress = "http://localhost:3501"
let staticsiteAddress = "http://localhost:40000"

if (getQueryVariable("code")) {
    fetch(serverAddress + '/oauth2/?code=' + getQueryVariable("code"))
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('avatar', data['avatar'])
            localStorage.setItem('id', data['discord_user_id'])
            localStorage.setItem('discrim', data['discriminator'])
            localStorage.setItem('session', data['session'])
            localStorage.setItem('username', data['username'])
            window.history.replaceState(null, null, window.location.pathname);
            renderAccountData()
        });
}

function renderAccountData() {
    if (localStorage.getItem("session")) {
        let avatar_url = 'https://cdn.discordapp.com/avatars/'+localStorage.getItem('id')+'/'+ localStorage.getItem('avatar')+'.jpg'
        e("disbtn").innerHTML = `<img src="${avatar_url}"><div>${localStorage.getItem('username')}#${localStorage.getItem('discrim')}</div><div class="online-tick"></div>`
    }
}
renderAccountData()

function trackScrollSidebar() {
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            e("sidebar-content").style.position = "fixed";
        } else {
            e("sidebar-content").style.position = "static";
        }
    });
}