// ui-utils.js - Utility functions for UI behavior

export function showView(id) {
    document.querySelectorAll('#app > section').forEach(sec => (sec.style.display = 'none'));
    const section = document.getElementById(id);
    if (section) section.style.display = 'block';
  }
  
  export function toLocalDatetimeInputValue(date = new Date()) {
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  
  export function prefillDatetime() {
    const datetimeInput = document.getElementById('datetime-input');
    if (datetimeInput) {
      datetimeInput.value = toLocalDatetimeInputValue();
    }
  }
  
  export function showFloatingNotice(text, color = 'orange') {
    const existing = document.getElementById('floating-tooltip');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'floating-tooltip';
    div.textContent = text;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.backgroundColor = color;
    div.style.color = 'white';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    div.style.zIndex = 10000;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
  }