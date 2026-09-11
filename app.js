(function () {
    "use strict";

    const doc = window.top.document;

    function injectStyle() {
        if (doc.getElementById("thermolab-client-style")) return;

        const style = doc.createElement("style");
        style.id = "thermolab-client-style";

        style.textContent = `
            a[href*="streamlit.io"],
            a[href*="github.com"] {
                display: none !important;
                visibility: hidden !important;
            }

            header[data-testid="stHeader"] {
                display: none !important;
                height: 0 !important;
            }

            .st-key-topnav {
                margin-top: 0 !important;
            }

            section[data-testid="stSidebar"] {
                will-change: transform;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                transform: translateX(100%) !important;
                transition: none !important;
                animation: none !important;
                pointer-events: none !important;
            }

            div[data-testid="stSidebarUserContent"] {
                visibility: hidden;
            }

            .st-key-sidebar_backdrop {
                display: none !important;
            }
        `;

        doc.head.appendChild(style);
    }

    function hideBadges() {
        doc.querySelectorAll(
            'a[href*="streamlit.io"], a[href*="github.com"]'
        ).forEach(function (element) {
            element.style.setProperty(
                "display",
                "none",
                "important"
            );

            element.style.setProperty(
                "visibility",
                "hidden",
                "important"
            );
        });
    }

    function ensureManifest() {
        const manifestUrl =
            doc.defaultView.location.origin + "/app/static/manifest.json";

        let manifest =
            doc.querySelector('link[rel="manifest"]');

        if (!manifest) {
            manifest = doc.createElement("link");
            manifest.rel = "manifest";
            doc.head.appendChild(manifest);
        }

        if (manifest.href !== manifestUrl) {
            manifest.href = manifestUrl;
        }
    }

    function isSidebarOpenRequested() {
        const styles = doc.querySelectorAll("style");
        for (let i = 0; i < styles.length; i++) {
            const text = styles[i].textContent;
            if (
                text.indexOf('stSidebar"]') !== -1 &&
                text.indexOf("translateX(0)") !== -1
            ) {
                return true;
            }
        }
        return false;
    }

    function enforceSidebarState() {
        const sidebar = doc.querySelector(
            'section[data-testid="stSidebar"]'
        );
        if (!sidebar) return;

        if (isSidebarOpenRequested()) return;

        sidebar.style.setProperty(
            "transform",
            "translateX(100%)",
            "important"
        );
        sidebar.style.setProperty(
            "transition",
            "none",
            "important"
        );
        sidebar.style.setProperty(
            "pointer-events",
            "none",
            "important"
        );
    }

    function fixTopNavigation() {
        const nav =
            doc.querySelector(".st-key-topnav");

        if (!nav) return;

        let element = nav;
        let depth = 0;

        while (element && depth < 8) {
            element.style.setProperty(
                "margin-top",
                "0px",
                "important"
            );

            element.style.setProperty(
                "padding-top",
                "0px",
                "important"
            );

            element = element.parentElement;
            depth++;
        }

        nav.style.setProperty(
            "padding-top",
            "8px",
            "important"
        );

        nav.style.setProperty(
            "margin-top",
            "0px",
            "important"
        );

        const header =
            doc.querySelector(
                'header[data-testid="stHeader"]'
            );

        if (header) {
            header.style.setProperty(
                "display",
                "none",
                "important"
            );

            header.style.setProperty(
                "height",
                "0px",
                "important"
            );
        }
    }

    function initialize() {
        injectStyle();
        ensureManifest();
        hideBadges();
        fixTopNavigation();
        enforceSidebarState();
    }

    initialize();

    if (!window.thermoLabObserver) {
        window.thermoLabObserver =
            new MutationObserver(function () {
                enforceSidebarState();

                requestAnimationFrame(function () {
                    hideBadges();
                    fixTopNavigation();
                    enforceSidebarState();
                });
            });

        window.thermoLabObserver.observe(
            doc.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    if (!window.thermoLabKeyboard) {
        window.thermoLabKeyboard = true;

        doc.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Escape") {
                    var closeBtn = doc.querySelector(
                        ".st-key-sidebar_close_x button"
                    );
                    if (closeBtn) closeBtn.click();
                }
            },
            false
        );
    }

    if (!window.thermoLabResize) {
        window.thermoLabResize = true;

        window.addEventListener(
            "resize",
            function () {
                requestAnimationFrame(
                    fixTopNavigation
                );
            },
            { passive: true }
        );
    }

})();
