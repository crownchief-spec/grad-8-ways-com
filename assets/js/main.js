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

  function initServiceSlider(){
    const slider = document.getElementById("serviceSlider");
    if(!slider) return;
    const track = slider.querySelector(".service-track");
    const slides = slider.querySelectorAll(".service-slide");
    const prevBtn = slider.querySelector(".prev");
    const nextBtn = slider.querySelector(".next");
    const currentSlideEl = document.getElementById("currentSlide");
    const totalSlidesEl = document.getElementById("totalSlides");
    let currentIndex = 0;
    let startX = 0;
    let currentTranslate = 0;
    const total = slides.length;
    if(totalSlidesEl) totalSlidesEl.textContent = total;
    function updateSlider(){
      if(track) track.style.transform = "translateX(-" + currentIndex * 100 + "%)";
      if(currentSlideEl) currentSlideEl.textContent = currentIndex + 1;
    }
    function goToSlide(index){
      currentIndex = Math.max(0, Math.min(index, total - 1));
      updateSlider();
    }
    if(prevBtn) prevBtn.addEventListener("click", function(){ goToSlide(currentIndex - 1); });
    if(nextBtn) nextBtn.addEventListener("click", function(){ goToSlide(currentIndex + 1); });
    track.addEventListener("touchstart", function(e){ startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchmove", function(e){ currentTranslate = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function(){
      const movedBy = currentTranslate - startX;
      if(movedBy < -50) goToSlide(currentIndex + 1);
      else if(movedBy > 50) goToSlide(currentIndex - 1);
      startX = 0;
      currentTranslate = 0;
    });
    updateSlider();
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    wireNav();
    initServiceSlider();
  });
})();
