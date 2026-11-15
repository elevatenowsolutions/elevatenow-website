document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('careersForm');
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('resume');
  const fileNameDisplay = document.getElementById('fileName');
  const status = form ? form.querySelector('.form-status') : null;

  if (!form) return;

  // Handle clicking the upload zone to open file browser
  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        fileNameDisplay.textContent = `Selected: ${file.name}`;
        uploadZone.style.borderColor = 'var(--brand)';
        uploadZone.style.background = 'rgba(79,70,229,0.04)';
      }
    });
  }

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const btn = form.querySelector('.btn-send');
    const originalBtnHTML = btn.innerHTML;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    btn.innerHTML = 'Submitting...';
    btn.disabled = true;
    if (status) status.textContent = '';

    setTimeout(() => {
      if (status) {
        status.textContent = "Application received! We'll review your profile and contact you if there's a fit.";
        status.style.color = "var(--brand)";
      }
      form.reset();
      if (fileNameDisplay) fileNameDisplay.textContent = '';
      if (uploadZone) {
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';
      }
      btn.innerHTML = originalBtnHTML;
      btn.disabled = false;
    }, 1500);
  });
});