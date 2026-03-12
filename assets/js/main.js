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
    const categoryToTheme = {
      "學士服個人畢業照": "Personal graduation photo",
      "個人便服照": "Casual portrait",
      "學生小組照": "Student group photo",
      "學生與老師合照": "Teacher & students photo",
      "上課照": "Classroom activity",
      "團體大合照": "Group graduation photo",
      "畢業典禮活動照": "Graduation ceremony",
      "攝影師工作側拍照": "Behind the scenes"
    };
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
          const category = item.category || "";
          return {
            thumbUrl: base + "assets/images/works/thumbs/" + thumbName,
            fullUrl: base + "assets/images/works/" + filename,
            category: category,
            theme: categoryToTheme[category] || category,
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
          const caption = document.createElement("span");
          caption.className = "works-grid-caption";
          caption.textContent = item.category || "";
          wrap.appendChild(caption);
          wrap.addEventListener("click", ()=> openLightbox(idx));
          wrap.addEventListener("keydown", e=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openLightbox(idx); } });
          grid.appendChild(wrap);
        });
      })
      .catch(()=>{
        grid.innerHTML = "<p class=\"small\">無法載入作品列表，請稍後再試。</p>";
      });
  }

  function initCeremonyWorksLightbox(){
    const grid = document.getElementById("ceremony-works-grid");
    if(!grid) return;

    const items = Array.from(grid.querySelectorAll(".works-grid-item img"));
    if(!items.length) return;

    const lightbox = document.getElementById("ceremony-lightbox");
    const lightboxImg = document.getElementById("ceremony-lightbox-img");
    const btnPrev = document.getElementById("ceremony-lightbox-prev");
    const btnNext = document.getElementById("ceremony-lightbox-next");
    let currentIndex = 0;

    function openAt(index){
      if(!lightbox || !lightboxImg) return;
      currentIndex = (index + items.length) % items.length;
      const img = items[currentIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function close(){
      if(!lightbox) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function goPrev(){ openAt(currentIndex - 1); }
    function goNext(){ openAt(currentIndex + 1); }

    items.forEach((img, idx)=>{
      const clickTarget = img.closest(".works-grid-item") || img;
      clickTarget.addEventListener("click", ()=> openAt(idx));
      clickTarget.addEventListener("keydown", e=>{
        if(e.key === "Enter" || e.key === " "){
          e.preventDefault();
          openAt(idx);
        }
      });
      clickTarget.setAttribute("role", "button");
      clickTarget.tabIndex = 0;
    });

    if(lightbox){
      lightbox.querySelectorAll("[data-lightbox-close]").forEach(el=>{
        el.addEventListener("click", close);
      });
      lightbox.addEventListener("click", close);
    }
    btnPrev?.addEventListener("click", e=>{ e.preventDefault(); e.stopPropagation(); goPrev(); });
    btnNext?.addEventListener("click", e=>{ e.preventDefault(); e.stopPropagation(); goNext(); });

    document.addEventListener("keydown", e=>{
      if(!lightbox || !lightbox.classList.contains("is-open")) return;
      if(e.key === "Escape"){ close(); }
      if(e.key === "ArrowLeft"){ e.preventDefault(); goPrev(); }
      if(e.key === "ArrowRight"){ e.preventDefault(); goNext(); }
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    wireNav();
    initHeroCarousel();
    initMoodSliders();
    initWorksGrid();
    initCeremonyWorksLightbox();
  });
})();
