(function () {
  // Helper logging function.
  const log = (msg) => console.log('[SurveyFiller]', msg);

  // Function to simulate a click in a safe way.
  const simulateClick = (element) => {
    if (element) {
      element.click();
    }
  };

  // Process all radio groups. For each, randomly select one radio.
  document.querySelectorAll('mat-radio-group').forEach((group, groupIndex) => {
    const radios = group.querySelectorAll('mat-radio-button');
    if (radios.length > 0) {
      const randomIndex = Math.floor(Math.random() * radios.length);
      const selectedRadio = radios[randomIndex];
      // Try to click the underlying input element; fallback to the component container.
      const input = selectedRadio.querySelector('input[type="radio"]');
      if (input) {
        simulateClick(input);
        log(`Radio group ${groupIndex}: clicked input in option ${randomIndex}`);
      } else {
        simulateClick(selectedRadio);
        log(`Radio group ${groupIndex}: clicked option ${randomIndex}`);
      }
    }
  });

  // Process checkboxes.
  // Assume that questions with checkboxes but without radio groups are "multiple-select".
  document.querySelectorAll('.question').forEach((question, qIndex) => {
    if (question.querySelector('mat-radio-group')) {
      // Skip questions that already have a radio group.
      return;
    }
    // Select all checkboxes within this question.
    const checkboxes = question.querySelectorAll('mat-checkbox');
    checkboxes.forEach((checkbox, cbIndex) => {
      // Randomly decide whether to check this one (50% chance).
      if (Math.random() > 0.5) {
        // Try clicking the underlying input if present; if not, click the checkbox component.
        const input = checkbox.querySelector('input[type="checkbox"]');
        if (input && !input.checked) {
          simulateClick(input);
          log(`Question ${qIndex} Checkbox ${cbIndex}: clicked input`);
        } else {
          simulateClick(checkbox);
          log(`Question ${qIndex} Checkbox ${cbIndex}: clicked component`);
        }
      }
    });
  });

  // Process text inputs (if any).
  document.querySelectorAll('input[type="text"]').forEach((input, index) => {
    const randomText = 'Random answer ' + Math.floor(Math.random() * 1000);
    input.value = randomText;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    log(`Text input ${index}: set to "${randomText}"`);
  });

  // Process range sliders (if any).
  document.querySelectorAll('input[type="range"]').forEach((slider, index) => {
    const min = parseInt(slider.getAttribute('min')) || 0;
    const max = parseInt(slider.getAttribute('max')) || 100;
    const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
    slider.value = randomVal;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    log(`Slider ${index}: set to ${randomVal}`);
  });

  log("Survey randomly filled.");
})();