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

// Sets checkboxes to extension sync data when popup.html loads
window.addEventListener("load", function (event) {
    chrome.storage.sync.get('switchKey', function (data) {
        var switches = Array(42);
        if (data.switchKey && data.switchKey.length) {
            for (var i = 0; i < data.switchKey.length; i++) {
                switches[i] = data.switchKey[i];
            }
        }
        var checkboxes = document.querySelectorAll(".mdl-js-checkbox");
        // Grabs all of the material design lite objects that are checkboxes
        for (var i = 0; i < checkboxes.length; i++) {
            var checkbox = checkboxes[i];
            if (switches[i]) {
                checkbox.MaterialCheckbox.check();
            } else {
                checkbox.MaterialCheckbox.uncheck();
            }
        }
    });
    var refreshBtn = document.getElementById("refresh");
    var checkboxInputs = document.getElementsByClassName("mdl-checkbox__input");
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async function (event) {
            var background = chrome.extension.getBackgroundPage();
            background.onRefresh();
            await background.saveInputs(checkboxInputs);
        });
    }

    var refreshBtn2 = document.getElementById("refresh2");
    var checkboxInputs = document.getElementsByClassName("mdl-checkbox__input");
    if (refreshBtn2) {
        refreshBtn2.addEventListener('click', async function (event) {
            var background = chrome.extension.getBackgroundPage();
            background.onRefresh();
            await background.saveInputs(checkboxInputs);
        });
    }

    var aboutBtn = document.getElementById("about");
    aboutBtn.addEventListener('click', function (event) {
        window.location = "about.html";
    });
}, true);

// Saves any changes the user made to the checkboxes into extension sync storage
window.addEventListener("unload", async function (event) {
    var checkboxes = document.getElementsByClassName("mdl-checkbox__input");
    var background = chrome.extension.getBackgroundPage();
    await background.saveInputs(checkboxes);
}, true);

function getFrameDocument(iframe){
    return iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
}