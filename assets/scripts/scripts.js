
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

let serverAddress = "https://api.valheimlist.org"
let staticsiteAddress = "https://valheimlist.org"

if (getQueryVariable("code")) {
if (localStorage.getItem('test')) {
        alert("you are in test mode")
    } else {
    //document.write("Intercepting Discord Oauth2 response...")
    fetch(serverAddress + '/oauth2/?code=' + getQueryVariable("code"))
        .then(response => {
            if (response.status != 200) {
                alert("Something went wrong accessing your Discord account. Please contact us so we can investigate in our support Discord. (linked at bottom of page)")
            return
            }
            window.history.replaceState(null, null, window.location.pathname);
            return response.json()
        })
        .then(data => {
            localStorage.setItem('avatar', data['avatar'])
            localStorage.setItem('id', data['discord_user_id'])
            localStorage.setItem('discrim', data['discriminator'])
            localStorage.setItem('session', data['session'])
            localStorage.setItem('username', data['username'])
            renderAccountData()
            window.location.href = localStorage.getItem("url_at_click_time")
        });
    }
}

function renderAccountData() {
    if (localStorage.getItem("session")) {
    let avatar_url
    	if(localStorage.getItem('avatar') == "") {
    	avatar_url = 'https://valheimlist.org/assets/img/nopic.png'
    	} else {
    	avatar_url = 'https://cdn.discordapp.com/avatars/'+localStorage.getItem('id')+'/'+ localStorage.getItem('avatar')+'.jpg'
    	}
        
        e("disbtn").innerHTML = `<div class="flair"></div><img src="${avatar_url}"><div class="text-discord">${localStorage.getItem('username')}#${localStorage.getItem('discrim')}</div><div class="online-tick"></div>`
    }
}
renderAccountData()

function trackScrollSidebar() {
    let loadTimePos = e("sidebar-content").getBoundingClientRect().top + window.scrollY - 45;

    window.addEventListener('scroll', function() {
        let elePosBot = (e("sidebar-content").getBoundingClientRect().top + window.scrollY) + e("sidebar-content").offsetHeight

        if (window.pageYOffset > loadTimePos) {
            if( elePosBot > (document.body.scrollHeight - 550)) {
                e("sidebar-content").style.opacity = "0";
            } else {
                e("sidebar-content").style.position = "fixed";
                e("sidebar-content").style.opacity = "1";
            }

        } else {
            e("sidebar-content").style.position = "static";
            e("sidebar-content").style.opacity = "1";
        }
    });
}

function registerGraphEvents() {
    e("graph-holder").addEventListener("mousemove", function (val) {
        var elem = document.elementFromPoint(val.clientX, val.clientY);
        //console.log(elem.dataset.count)

        var offset = new Date().getTimezoneOffset();
        let utc_date = new Date(Date.parse(elem.dataset.time));
        let date = utc_date.toLocaleString()

        if (!isNaN(elem.dataset.count)) {
            if (elem.dataset.count == -1) {
                e("graph-tt").innerHTML = `<span>${date}</span> Server down`;
            } else {
                e("graph-tt").innerHTML = `<span>${date}</span> ${elem.dataset.count} Players`;
            }
        } else {
            e("graph-tt").innerHTML = `<span>Unknown</span> Data unavailable`;
        }
    });
}


function shiftReviews(direction) {
e("reviews-container").scrollIntoView();
    let legend = e("review-count").getElementsByTagName("b")[0].innerText.split(" - ")[0];
    let maxval = e("review-count").getElementsByTagName("b")[1].innerText;
    //console.log(legend)
    legend-- //always subtract one to go from display index to real index starting at zero
    console.log(maxval)
    console.log(legend)
    while (true) {
        if (direction) {
            if (legend + 3 >= maxval) {
                return
            }
            setupReviews(legend + 3)
        } else {
            if (legend - 3 < 0) {
                legend++
                continue
            }
            setupReviews(legend - 3)
        }
        break
    }


}

function showFullReview(currentElm) {
    currentElm.style.display = "none";
    let elm = currentElm.parentElement.getElementsByTagName("p")[0];
    let fulltext = elm.getAttribute("data-fulltext");
    elm.innerText = fulltext;
    elm.style.whiteSpace = "pre-wrap";
}


function setupReviews(reviewPointer) {
    let reviewItems = document.getElementsByClassName("review-item")

    for (let i = 0; i < reviewItems.length; i++) {
        reviewItems[i].style.display = "none";
        //console.log(i, i < reviewPointer + 3, i >= reviewPointer)
        if (i < reviewPointer + 3 && i >= reviewPointer) {
            reviewItems[i].style.display = "block";
        } else {

        }
    }

    let legendlow = reviewPointer + 1
    let legendhigh
    if (reviewPointer + 3 > reviewItems.length) {
        legendhigh = reviewItems.length
    } else {
        legendhigh = reviewPointer + 3
    }


    let legend = document.getElementsByClassName("review-count")[0];
    legend.innerHTML = `Showing <b>${legendlow} - ${legendhigh}</b> of <b>${reviewItems.length}</b> reviews.`

    let backTemplate = `<div id="pag-last" onclick="shiftReviews(false)">Back</div>`
    let nextTemplate = `<div id="pag-next" onclick="shiftReviews(true)">Next</div>`
    let dom = "";

    console.log(reviewPointer)
    if (!(reviewPointer -3 < 0)) {
        dom += backTemplate
    }
    if (!(reviewPointer + 3 > legendhigh)) {
        dom += nextTemplate
    }

    e("pagination").innerHTML = dom;

}

function discord_button_action() {

    if (localStorage.getItem('session')) {
        window.open("/listownedservers.html", "_self")
    } else {
        localStorage.setItem('url_at_click_time', window.location.href)
        window.open('https://discord.com/oauth2/authorize?client_id=845109868985450517&redirect_uri=https%3A%2F%2Fvalheimlist.org%2F&response_type=code&scope=identify%20guilds%20guilds.join', "_self")
    }
}

function showCommentsInput() {

    if (localStorage.getItem("session")) {
        e("leave-review").innerHTML = `<p>Loading...</p>`
        let getReviewPackage = {
            discord_id: localStorage.getItem('id'),
            server: location.pathname.split("/").slice(-1)[0].split(".")[0]
        };
        fetch(serverAddress + '/reviewget', {
            method: "POST",
            body: JSON.stringify(getReviewPackage),
            headers: {
                'session': localStorage.getItem('session'),
                'uid': localStorage.getItem('id')
            },
        }).then(response => {
            if (response.status === 200) {
                e("leave-review").innerHTML = `<p>You have reviewed this server. It can take 5 minutes to appear.<span style="font-size: 10px;color: #a86b6b;cursor:pointer;" onclick="sendReview(true)">Delete review?</span></tov></p>`
            } else {
                e("leave-review").innerHTML = `<textarea id="review-text" placeholder="Write your review here."></textarea>
    <div>
    <span>Rate your experience:</span>
        <select id="exp">
                <option value="pos">Positive</option>
                <option value="neg">Negative</option>
            </select>
        <button onclick="sendReview()">Submit</button>
    </div>`
            }
        });

    }
}

function sendReview(deleteReview) {
    let reviewPackage
    if (deleteReview) {
        let result = confirm("Are you sure? Deleting a review cannot be undone. Once deleted you may leave a new review.");
        if (!result) return
        reviewPackage = {
            review: "",
            experience: false,
            server: location.pathname.split("/").slice(-1)[0].split(".")[0]
        };
    } else {
        reviewPackage = {
            review: e("review-text").value,
            experience: e("exp").value == "pos",
            server: location.pathname.split("/").slice(-1)[0].split(".")[0]
        };
        if (e("review-text").value === "") return
    }

    fetch(serverAddress + '/reviewcreate', {
        method: "POST",
        body: JSON.stringify(reviewPackage),
        headers: {
            'session': localStorage.getItem('session'),
            'uid': localStorage.getItem('id')
        },
    }).then(response => {
        console.log(response)
        if (response.status == 200) {
            window.location.reload();
        }
    });
}

function getGraphs(){
    Array.from(document.getElementsByClassName("server-item")).forEach(item =>
    fetch(staticsiteAddress + '/listing/' + item.dataset.server, {
            method: "GET"
        }).then(response => response.text()).then(response => {
            let graphContent = response.split("<div id=\"graph-holder\" class=\"graph-holder\">")[1]
                graphContent = graphContent.split("</div>\n                        <div id=\"graph-tt\"><span>?</span> ? Players</div>")[0]

            let maxCount = response.split("<div class=\"num-count-display\">")[1]
            maxCount = maxCount.split("</div>")[0]

            item.getElementsByClassName("graph-holder")[0].innerHTML = graphContent;
        item.getElementsByClassName("num-count-display")[0].innerHTML = maxCount;
        item.getElementsByClassName("num-count-display")[0].insertAdjacentHTML("afterend","<div class=\"hack-flair-encompassing\"></div>")
        }

    )
    );
}

let searchData
let searchDataProcessed = []

function downloadSearchData() {
    fetch(staticsiteAddress + '/search.json', {
        method: "GET"
    }).then(response => response.text()).then(response => {
        searchData = JSON.parse(response)

        let i =0
        searchData.servers.forEach(item => {
            let key = Object.keys(searchData.servers[i])[0]
            let value = Object.values(searchData.servers[i])[0]
            var obj = {};
            obj[key] = value
            searchDataProcessed.push(obj)
            i++
        })

    })
}
function fuzzysearch(needle, haystack) {
    var hlen = haystack.length;
    var nlen = needle.length;
    if (nlen > hlen) {
        return false;
    }
    if (nlen === hlen) {
        return needle === haystack;
    }
    outer: for (var i = 0, j = 0; i < nlen; i++) {
        var nch = needle.charCodeAt(i);
        while (j < hlen) {
            if (haystack.charCodeAt(j++) === nch) {
                continue outer;
            }
        }
        return false;
    }
    return true;
}

let ListHTML
let firstSearch = true
function search(input) {
    if (firstSearch === true) {
        ListHTML = e("server-list").innerHTML
        firstSearch = false;
    }

    e("notif-util").style.display = "none";

    input = input.toLowerCase()
    if (input === "") {
        e("server-list").innerHTML = ListHTML
        return
    }
    e("server-list").innerHTML = ""
    e("notif-util").style.display = "block";

    let successCount = 0
    let bestMatch = ""
    for (let key in searchDataProcessed) {
        let keyName = Object.keys(searchDataProcessed[key])[0].toLowerCase()

        //const keyName = key.toLowerCase().split('\\').join('')
        if (fuzzysearch(input, keyName)) {
            let html = `<a style="margin-top: 25px;" href="/listing/${Object.values(searchDataProcessed[key])[0]}" class="server-item" data-server="${Object.values(searchDataProcessed[key])[0]}">
                <div class="item-top">
                    <img loading="lazy" src="https://valheimlist.org/assets/img/logo_icon_only_zoom_optim.webp">
                    <div class="server-name"><h3>${Object.keys(searchDataProcessed[key])[0]}</h3></div>
                    <p>Loading...</p>
                    <div>
                        <div class="whitelist item-desc">
                            <div>Players</div>
                            <div>...</div>
                        </div>
                        <div class="reviews item-desc">
                            <div>Feedback</div>
                            <div>...</div>
                        </div>
                    </div>
                </div>

                <div class="graph">
                <div>
                    <div class="num-count-display">...</div><div class="hack-flair-encompassing"></div>
                </div>
                <div class="graph-holder"></div>
                </div>
            </a>`

            e("server-list").insertAdjacentHTML('beforeend', html)
            if (successCount === 0) {
                bestMatch = key
            }
            successCount++
            if (successCount >= 10) {
                break
            }
        }

    }

    if (successCount >= 10) {
        e("notif-util").innerHTML = "More than 10 results. Only showing top 10.";
    } else if (successCount > 0) {
        e("notif-util").innerHTML = `${successCount} results found.`
    } else {
        e("notif-util").innerHTML = "<b>No results.</b> Try searching single words from the server's name."
    }

    Array.from(e("server-list").getElementsByTagName("a")).forEach(item => {
        fetch(staticsiteAddress + '/listing/' + item.dataset.server, {
            method: "GET"
        }).then(response => response.text()).then(response => {
                let graphContent = response.split("<div id=\"graph-holder\" class=\"graph-holder\">")[1]
                graphContent = graphContent.split("</div>\n                        <div id=\"graph-tt\"><span>?</span> ? Players</div>")[0]

                let maxCount = response.split("<div class=\"num-count-display\">")[1]
                maxCount = maxCount.split("</div>")[0]

                item.getElementsByClassName("graph-holder")[0].innerHTML = graphContent;
                item.getElementsByClassName("num-count-display")[0].innerHTML = maxCount;
                item.getElementsByClassName("num-count-display")[0].insertAdjacentHTML("afterend","<div class=\"hack-flair-encompassing\"></div>")


		console.log(response)	
            let img = response.split(`f=auto&#x2F;img&#x2F;`)[1]
            img = img.split("\">")[0]
            let urlpart1 = img.split("&#x2F;")[0]
            let urlpart2 = img.split("&#x2F;")[1]
            console.log(img)

            item.getElementsByTagName("img")[0].src = `https://cdn.statically.io/img/api.valheimlist.org/w=1280,f=auto/img/${urlpart1}/${urlpart2}`;

            let count = response.split(`<span id="pcount_split">`)[1];
            count = count.split("</span>")[0];

            item.getElementsByClassName("whitelist")[0].getElementsByTagName("div")[1].innerHTML = count;

            let fb = response.split(`<span id="fb_split">`)[1]
            fb = fb.split("</span>")[0]

            item.getElementsByClassName("reviews")[0].getElementsByTagName("div")[1].innerHTML = fb;

            let summary = response.split(`<p id="server-summary">`)[1]
            summary = summary.split("</p>")[0]

                item.getElementsByTagName("p")[0].innerHTML = summary;

            })
    })



}

function showImageModal(image) {
let modal = document.getElementsByClassName("image-modal")[0]
let img = modal.getElementsByTagName("img")[0]
if (image) {
modal.style.display = "block";
img.src = image;
} else {
modal.style.display = "none";
img.src = "";
}
}

function logout() {
localStorage.removeItem("username");
localStorage.removeItem("session");
localStorage.removeItem("avatar");
window.location.href = "https://valheimlist.org"
}
