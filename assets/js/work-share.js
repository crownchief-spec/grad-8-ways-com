(function () {
  var container = document.querySelector('[data-work-share]');
  if (!container) return;
  var url = container.getAttribute('data-share-url') || location.href;
  var copyBtn = container.querySelector('[data-copy-link]');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          var t = copyBtn.textContent;
          copyBtn.textContent = '已複製';
          setTimeout(function () { copyBtn.textContent = t; }, 1500);
        });
      } else {
        var input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        var t = copyBtn.textContent;
        copyBtn.textContent = '已複製';
        setTimeout(function () { copyBtn.textContent = t; }, 1500);
      }
    });
  }
})();
