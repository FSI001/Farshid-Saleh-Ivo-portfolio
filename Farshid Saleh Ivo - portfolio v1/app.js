/* ==========================================================================
   Farshid Saleh Ivo — shared scripts
   - mobile navigation
   - current year in the footer
   - live YouTube subscriber counts (Netlify Function)
   - memorial notice (shown once a week)
   - contact form (Formspree, no page reload)
   No dependencies, no inline handlers, works with the CSP in netlify.toml.
   ========================================================================== */
(function () {
    "use strict";

    /* Mobile navigation ---------------------------------------------------- */
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");

    if (toggle && nav) {
        const label = toggle.querySelector(".nav-toggle__label");

        const setOpen = (open) => {
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            nav.classList.toggle("is-open", open);
            if (label) label.textContent = open ? "Close" : "Menu";
        };

        toggle.addEventListener("click", () => {
            setOpen(toggle.getAttribute("aria-expanded") !== "true");
        });

        nav.addEventListener("click", (event) => {
            if (event.target.closest("a")) setOpen(false);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
                setOpen(false);
                toggle.focus();
            }
        });

        document.addEventListener("click", (event) => {
            if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
        });

        const desktop = window.matchMedia("(min-width: 821px)");
        const closeOnDesktop = (event) => {
            if (event.matches) setOpen(false);
        };
        if (typeof desktop.addEventListener === "function") {
            desktop.addEventListener("change", closeOnDesktop);
        }
    }

    /* Footer year ---------------------------------------------------------- */
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = year;
    });

    /* YouTube subscriber counts ------------------------------------------- */
    const countEls = document.querySelectorAll("[data-channel-id]");
    if (countEls.length) {
        const CACHE_KEY = "fsi:subscriber-counts:v1";
        const CACHE_TTL = 10 * 60 * 1000;
        const exact = new Intl.NumberFormat("en-US");
        const compact = new Intl.NumberFormat("en", {
            notation: "compact",
            maximumFractionDigits: 1
        });

        const readCache = () => {
            try {
                const raw = sessionStorage.getItem(CACHE_KEY);
                if (!raw) return null;
                const saved = JSON.parse(raw);
                if (!saved || !saved.counts || Date.now() - saved.at > CACHE_TTL) return null;
                return saved.counts;
            } catch (error) {
                return null;
            }
        };

        const writeCache = (counts) => {
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), counts }));
            } catch (error) {
                /* storage full or disabled — not important */
            }
        };

        const apply = (counts) => {
            countEls.forEach((el) => {
                const raw = counts[el.dataset.channelId];
                const value = el.querySelector("[data-sub-value]");
                const total = Number(raw);
                if (!value || !Number.isFinite(total) || total <= 0) return;
                /* Exact below 10k so a small channel doesn't read "1K". */
                value.textContent = total < 10000 ? exact.format(total) : compact.format(total);
                value.title = exact.format(total) + " subscribers";
                el.hidden = false;
            });
        };

        const load = async () => {
            const cached = readCache();
            if (cached) {
                apply(cached);
                return;
            }

            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 6000);
                const response = await fetch("/.netlify/functions/subscribers", {
                    headers: { Accept: "application/json" },
                    signal: controller.signal
                });
                clearTimeout(timer);
                if (!response.ok) throw new Error("Subscriber request failed");

                const data = await response.json();
                if (!data || typeof data.counts !== "object" || data.counts === null) {
                    throw new Error("Unexpected subscriber response");
                }

                apply(data.counts);
                writeCache(data.counts);
            } catch (error) {
                /* Leave the counts hidden; the channel cards still work. */
            }
        };

        load();
    }

    /* Memorial notice ------------------------------------------------------ */
    /* Shown once a week, as on the previous site. Dismissing it stores the
       timestamp; the close button, Escape and a click on the backdrop all
       dismiss it. */
    const popup = document.getElementById("welcomePopup");
    if (popup) {
        const STORAGE_KEY = "popupLastShown";
        const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
        const closeBtn = document.getElementById("closePopupBtn");

        const lastShown = () => {
            try {
                return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
            } catch (error) {
                return 0;
            }
        };

        const isDue = () => Date.now() - lastShown() > ONE_WEEK;

        let returnFocusTo = null;

        const closePopup = () => {
            popup.classList.remove("is-open");
            document.body.classList.remove("is-locked");
            window.setTimeout(() => {
                popup.hidden = true;
            }, 300);
            if (returnFocusTo && typeof returnFocusTo.focus === "function") returnFocusTo.focus();
        };

        const openPopup = () => {
            returnFocusTo = document.activeElement;
            popup.hidden = false;
            document.body.classList.add("is-locked");
            void popup.offsetWidth; /* let the fade-in transition run */
            popup.classList.add("is-open");
            if (closeBtn) closeBtn.focus();
            try {
                window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
            } catch (error) {
                /* private mode — show it again next visit, no harm */
            }
        };

        if (closeBtn) closeBtn.addEventListener("click", closePopup);

        popup.addEventListener("click", (event) => {
            if (event.target === popup) closePopup();
        });

        document.addEventListener("keydown", (event) => {
            if (popup.hidden) return;
            if (event.key === "Escape") {
                closePopup();
            } else if (event.key === "Tab") {
                /* Only one control inside, so keep focus on it. */
                event.preventDefault();
                if (closeBtn) closeBtn.focus();
            }
        });

        if (isDue()) {
            if (document.readyState === "complete") {
                window.setTimeout(openPopup, 400);
            } else {
                window.addEventListener("load", () => window.setTimeout(openPopup, 400), { once: true });
            }
        }
    }

    /* Contact form --------------------------------------------------------- */
    const form = document.getElementById("contactForm");
    if (form) {
        const status = document.getElementById("formStatus");
        const button = document.getElementById("submitBtn");
        const buttonMarkup = button ? button.innerHTML : "";

        const showStatus = (message, type) => {
            if (!status) return;
            status.textContent = message;
            status.className = type ? "form-status is-" + type : "form-status";
        };

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (button) {
                button.disabled = true;
                button.classList.add("is-loading");
                button.setAttribute("aria-busy", "true");
                button.textContent = "Sending…";
            }
            showStatus("", "");

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { Accept: "application/json" }
                });

                if (!response.ok) throw new Error("Form submission failed");

                form.reset();
                showStatus("Message sent — thank you! I'll get back to you soon.", "success");
            } catch (error) {
                if (status) {
                    status.className = "form-status is-error";
                    status.innerHTML = 'Something went wrong. Please try again, or reach me on <a href="https://www.fiverr.com/yoyofsi?public_mode=true" target="_blank" rel="noopener">Fiverr</a>.';
                }
            } finally {
                if (button) {
                    button.disabled = false;
                    button.classList.remove("is-loading");
                    button.removeAttribute("aria-busy");
                    button.innerHTML = buttonMarkup;
                }
            }
        });
    }
})();
