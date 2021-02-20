// Copyright 2019 Jeffrey Tucker

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// List of websites associated with Vivaldi Browser bookmark urls
var urls = ["https://*.booking.com/*", "https://*.ebay.com/*", "https://*.amazon.com/*", "https://*.aliexpress.com/*", "https://*.homedepot.com/*", "https://*.target.com/*", "https://*.airbnb.com/*", "https://*.instacart.com/*", "https://*.walmart.com/*", "https://*.macys.com/*", "https://*.overstock.com/*", "https://*.rakuten.com/*", "https://*.expedia.com/*", "https://*.hulu.com/*", "https://*.morrisons.com/*", "https://*.agoda.com/*"];

// List of Vivaldi Browser bookmark urls
var vivaldiUrls = ["https://vivaldi.com/bk/bookingcom-en-us", "https://vivaldi.com/bk/ebay-en-us", "https://vivaldi.com/bk/amazon", "https://vivaldi.com/bk/aliexpresscom-us", "http://vivaldi.com/bk/homedepot-us", "https://vivaldi.com/bk/target-us",  "https://vivaldi.com/bk/airbnb-us-bk", "https://vivaldi.com/bk/sd-instacart-en-us", "https://vivaldi.com/bk/walmart-pc", "https://vivaldi.com/bk/macys-en-us-bk", "https://vivaldi.com/bk/overstock-us-bk", "https://vivaldi.com/bk/rakuten-us-bk", "https://vivaldi.com/bk/expedia", "https://vivaldi.com/bk/hulu", "https://vivaldi.com/bk/morrisons-gb", "https://vivaldi.com/bk/agoda-in-sd"];

var previousUrl = "https://sirfredrick.vivaldi.net/"; // Placeholder url for intial value
var previousVivaldiUrl = "https://sirfredrick.vivaldi.net/"; // Placeholder url for intial value
var bob = 0;

// Sets extension sync data so that all checkboxes are selected on install
chrome.runtime.onInstalled.addListener(function () {
    var switches = Array(15).fill(true);
    chrome.storage.sync.set({ "switchKey": switches }, function () {
        console.log("Initial save!");
    });
});

// Runs after the user enters the url but before the webrequest is sent
chrome.webRequest.onBeforeRequest.addListener(
    async function (details) {
        var vivaldiUrl = await getVivaldiUrl(details);

        // Checks if the vivaldi url variable is string not a Promise
        if (typeof vivaldiUrl === "string") {
            // Grabs current tab from current window and sets the url to vivaldi url
            chrome.tabs.query({ lastFocusedWindow: true, active: true }, function (tabs) {
                if (getDomain(tabs[0].url) === getDomain(details.url)) {
                    console.log("Redirecting " + details.url + " -> " + vivaldiUrl);
                    chrome.tabs.update(tabs[0].id, { url: vivaldiUrl });
                    previousVivaldiUrl = vivaldiUrl;
                }
            });
        }
    },
    { urls: urls }
);

// Gets the vivaldi url that matches the current webpage if there is one
async function getVivaldiUrl(details) {
    return new Promise(
        await async function (resolve, reject) {
            var i;
            var shouldStop;
            for (i = 0; (i < 15) && !shouldStop; i++) {
                // If the current url matches any on the list AND
                // to prevent looping redirects, if the previous Vivaldi url is not the same as the current Vivaldi url...
                if (getDomain(urls[i]) === getDomain(details.url)) {
                    if (vivaldiUrls[i] !== previousVivaldiUrl) {
                        console.log("i: " + i);
                        var isChecked = await checkIfChecked(i);
                        console.log("isChecked: " + isChecked)
                        if (isChecked) {
                            previousUrl = details.url;
                            resolve(vivaldiUrls[i]);
                            shouldStop = true;
                        }
                    }
                }
            }
        }
    );
}

// Check if the current url has been selected by the user in popup.html
async function checkIfChecked(i) {
    return new Promise(
        await async function (resolve, reject) {
            chrome.storage.sync.get('switchKey', await async function (data) {
                if (data.switchKey && data.switchKey[i]) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }
    )
}

// Converts full url to comparable url (only the domain)
function getDomain(url) {
    // Removes http:// and https://
    var prefix = /^https?:\/\//;
    // Grabs the set of characters between a '.' and '.com', '.biz', or '.org'
    var domain = /^.*?([A-Za-z0-9-]+\.com|[A-Za-z0-9-]+\.biz|[A-Za-z0-9-]+\.org)/;
    // Removes prefix
    url = url.replace(prefix, "");
    // Applies domain filtering
    var match = url.match(domain);
    if (match) {
        // Grabs the domain not the subdomain
        return (match[1]);
    }
    return (null);
}

// Allows popup.js to console.log to background page
function log(x) {
    console.log(x);
}
// Grabs what checkboxes are currently check and stores them to extension sync storage
async function saveInputs(checkboxes) {
    var switches = Array(15).fill(true);
    for (var i = 0; i < switches.length; i++) {
        switches[i] = checkboxes[i].checked;
    }
    chrome.storage.sync.set({ "switchKey": switches }, await async function () {
        console.log("Switch array saved!");
    });
}

async function saveRefresh(didRefresh) {
    chrome.storage.sync.set({"didRefresh": didRefresh }, await async function () {
        console.log("Save refresh: " + didRefresh);
    });
}

function onRefresh() {
    previousVivaldiUrl = "https://sirfredrick.vivaldi.net/";
    chrome.tabs.query({ lastFocusedWindow: true, active: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
    });
}
