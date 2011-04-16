/* Injection Code BelugaXpander.js is based on helper.js of drikin.com */
(function () {

    // variables
    var base_title = document.title;
    var last_update_id = getLastUpdateId();
    var unread_count = 0;
    var settings = {};


    // Event Process
    // initialize after loaded


    function initAfterLoaded(event) {
        base_title = document.title;
        last_update_id = getLastUpdateId();
        document.getElementById("composebutton").addEventListener("click", click, false);
        safari.self.tab.dispatchMessage("getSettingValue", "useShiftEnterToPost"); // ask for value
        safari.self.tab.dispatchMessage("getSettingValue", "enableAutoOpenUrl"); // ask for value
        document.body.innerHTML = document.body.innerHTML + '<object type="application/x-growl-safari-bridge" width="0" height="0" id="growl-safari-bridge"></object>';
        window.GrowlSafariBridge = document.getElementById('growl-safari-bridge');
    }

    // receive message
    function getMessage(msgEvent) {
        if (msgEvent.name == "settingValueIs") {
            settings[msgEvent.message.attr] = msgEvent.message.value;
        }
    }


    function focus() {
        resetCount();
    }

    function click() {
        last_update_id++;
    }

    function keydown(event) {
        if (event.keyIdentifier === "Enter") {
            var withModifierKey = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;

            if (event.keyCode == 13) {
                var useShiftEnterToPost = settings["useShiftEnterToPost"];
                if (useShiftEnterToPost && withModifierKey || !useShiftEnterToPost && !withModifierKey) {
                    var cf = document.getElementById("composeform");
                    cf.submit();
                    last_update_id++;
                    // make sure for clearing
                    setTimeout(function () {
                        document.getElementById("composetext").value = "";
                    }, 0);
                }
            }
        }
    }

    function update(event) {
        if (last_update_id < 0) {
            return;
        }
        var id = getLastUpdateId();
        if (id > last_update_id) {
            last_update_id = id;

            // update window title
            unread_count++;
            document.title = base_title + "(" + unread_count + ") ";
            safari.self.tab.dispatchMessage("setUnread_Count", unread_count);

            // show notification
            var lu = getLastUpdateElement();
            if (is_mobile()) {
                var img_url = lu.getElementsByClassName("user-tile upic")[0].childNodes[1].src;
                var name = lu.getElementsByClassName("text")[0].childNodes[2].textContent;
                var status = lu.getElementsByClassName("utext")[0].textContent;
            } else {
                var img_url = lu.getElementsByClassName("userimg")[0].src;
                var name = lu.getElementsByClassName("uname")[0].textContent;
                var status = lu.getElementsByClassName("ustatus")[0].textContent;
            }

            showNotification({"img_url": img_url, "name": name, "status": status});
            openUrlFromText(status);
        }
    }

    // Common functions
    function resetCount() {
        document.title = base_title;
        unread_count = 0;
        safari.self.tab.dispatchMessage("setUnread_Count", unread_count);
    }

    function showNotification(msg) {
            GrowlSafariBridge.notifyWithOptions(msg.name, msg.status, {
                isSticky: false,
                priority: -1,
                imageUrl: msg.img_url
            });
    }

	function openUrlFromText(text) {
        var enableAutoOpenUrl = settings["enableAutoOpenUrl"];
        if (enableAutoOpenUrl) {
            var urls = text.match(/https?:\/\/\S+/g);
            if (urls) {
                for (var i = 0, n = urls.length; i < n; i++) {
			        safari.self.tab.dispatchMessage("openUrlOnNewTabBackground", urls[i]);
                }
            }
        }
    }

    function getLastUpdateElement() {
        var ru = document.getElementById("realupdates");
        if (ru == null) {
            return null;
        }
        if (is_mobile()) {
            return ru.getElementsByClassName("update-item")[0];
        } else {
            return ru.getElementsByClassName("update")[0];
        }
    }

    function getLastUpdateId() {
        var lu = getLastUpdateElement();
        if (lu == null) {
            return -1;
        }
        return lu.id;
    }

    function is_mobile() {
        var fl = document.getElementById("footer-links");
        return (fl == null) ? false : true;
    }

    // initialize
    safari.self.addEventListener("message", getMessage, false); // wait for reply
    window.addEventListener("focus", focus, false);
    document.addEventListener("keydown", keydown, false);
    document.addEventListener("DOMContentLoaded", initAfterLoaded, false);
    document.addEventListener("DOMNodeInserted", update, false);

})();