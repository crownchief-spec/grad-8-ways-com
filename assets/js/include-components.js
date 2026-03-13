(function(){
  var pathname = typeof location !== "undefined" ? location.pathname : "";
var base = (pathname.indexOf("/pages/") !== -1 || pathname.indexOf("/seo") === 0 || pathname.indexOf("/case") === 0) ? "../" : "";

  function inject(placeholderId, url, runNavAfter) {
    var el = document.getElementById(placeholderId);
    if (!el) return;
    fetch(base + url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        el.outerHTML = html;
        if (runNavAfter) {
          var navToggle = document.querySelector("[data-nav-toggle]");
          var navMenu = document.querySelector("[data-nav-menu]");
          if (navToggle && navMenu) {
            navToggle.addEventListener("click", function() {
              var open = navMenu.classList.toggle("open");
              navToggle.setAttribute("aria-expanded", String(open));
            });
          }
        }
      })
      .catch(function() {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      inject("site-header-placeholder", "components/header.html", true);
      inject("site-footer-placeholder", "components/footer.html", false);
    });
  } else {
    inject("site-header-placeholder", "components/header.html", true);
    inject("site-footer-placeholder", "components/footer.html", false);
  }
})();
