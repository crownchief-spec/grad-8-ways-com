(function(){
  function wireNav(){
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if(toggle && menu){
      toggle.addEventListener("click", ()=>{
        const open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function initHeroCarousel(){
    const carousel = document.getElementById("heroCarousel");
    if(!carousel) return;
    const imgs = carousel.querySelectorAll("img");
    if(imgs.length === 0) return;
    let idx = 0;
    imgs[0].classList.add("active");
    setInterval(function(){
      imgs[idx].classList.remove("active");
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add("active");
    }, 4500);
  }

  function initMoodSliders(){
    const sliders = document.querySelectorAll("[data-mood-slider]");
    sliders.forEach(slider=>{
      const slides = slider.querySelectorAll(".mood-slide");
      if(!slides.length) return;
      let idx = 0;
      slides[0].classList.add("active");
      setInterval(()=>{
        slides[idx].classList.remove("active");
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add("active");
      }, 6000);
    });
  }

  function shuffleArray(arr){
    const a = arr.slice();
    for(let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initWorksGrid(){
    const grid = document.getElementById("works-grid");
    if(!grid) return;
    const base = document.querySelector("main.subpage") ? "../" : "";
    const lightbox = document.getElementById("works-lightbox");
    const lightboxImg = document.getElementById("works-lightbox-img");
    const lightboxPrev = document.getElementById("works-lightbox-prev");
    const lightboxNext = document.getElementById("works-lightbox-next");
    let worksList = [];
    let currentIndex = 0;

    function openLightbox(index){
      if(!worksList.length || !lightbox || !lightboxImg) return;
      currentIndex = (index + worksList.length) % worksList.length;
      const item = worksList[currentIndex];
      lightboxImg.src = item.fullUrl;
      lightboxImg.alt = item.alt;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox(){
      if(!lightbox) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function goPrev(){ openLightbox(currentIndex - 1); }
    function goNext(){ openLightbox(currentIndex + 1); }

    if(lightbox){
      lightbox.querySelectorAll("[data-lightbox-close]").forEach(el=> el.addEventListener("click", closeLightbox));
      lightbox.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
      lightbox.querySelector(".lightbox-inner")?.addEventListener("click", e=> e.stopPropagation());
      lightboxPrev?.addEventListener("click", e=>{ e.preventDefault(); goPrev(); });
      lightboxNext?.addEventListener("click", e=>{ e.preventDefault(); goNext(); });
      document.addEventListener("keydown", function onKey(e){
        if(!lightbox.classList.contains("is-open")) return;
        if(e.key === "Escape"){ closeLightbox(); return; }
        if(e.key === "ArrowLeft"){ goPrev(); e.preventDefault(); return; }
        if(e.key === "ArrowRight"){ goNext(); e.preventDefault(); }
      });
    }

    fetch(base + "assets/data/works-photos-meta.json")
      .then(r=>r.json())
      .then(meta=>{
        worksList = shuffleArray(meta).map(item=>{
          const filename = item.newName || item.oldName;
          const thumbName = item.newName || item.oldName;
          return {
            thumbUrl: base + "assets/images/works/thumbs/" + thumbName,
            fullUrl: base + "assets/images/works/" + filename,
            alt: item.title ? (item.category + "｜" + item.title) : (item.category || "小巴老師攝影 畢業照作品"),
            title: item.title || item.category || ""
          };
        });
        worksList.forEach((item, idx)=>{
          const wrap = document.createElement("div");
          wrap.className = "works-grid-item";
          wrap.setAttribute("role", "button");
          wrap.tabIndex = 0;
          wrap.setAttribute("aria-label", "查看大圖：" + (item.title || item.alt));
          const img = document.createElement("img");
          img.src = item.thumbUrl;
          img.alt = item.alt;
          img.title = item.title || "";
          img.loading = "lazy";
          img.onerror = function(){ this.src = item.fullUrl; };
          wrap.appendChild(img);
          wrap.addEventListener("click", ()=> openLightbox(idx));
          wrap.addEventListener("keydown", e=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openLightbox(idx); } });
          grid.appendChild(wrap);
        });
      })
      .catch(()=>{
        grid.innerHTML = "<p class=\"small\">無法載入作品列表，請稍後再試。</p>";
      });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    wireNav();
    initHeroCarousel();
    initMoodSliders();
    initWorksGrid();
  });
})();
