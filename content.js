// content.js

// 1. Simple Scraper to find Product Name & Price (Heuristic)
function getPageDetails() {
  // This is a generic guesser. For specific sites (Amazon), you'd target specific IDs.
  const title = document.title || "Unknown Item";
  
  // Try to find a price (very rough heuristic looking for currency symbols)
  const bodyText = document.body.innerText;
  const priceMatch = bodyText.match(/(\$|£|€)\d+(?:,\d{3})*(?:\.\d{2})?/);
  const price = priceMatch ? priceMatch[0] : "unknown price";
  
  return { title, price };
}

function triggerCooldown() {
  if (document.getElementById('impulse-overlay')) return;

  const { title, price } = getPageDetails();

  const overlay = document.createElement('div');
  overlay.id = 'impulse-overlay';
  
  overlay.innerHTML = `
    <div class="impulse-modal">
      <h2>🤖 AI Financial Reality Check</h2>
      <p>You are attempting to buy: <br><strong>${title.substring(0, 50)}...</strong> (~${price})</p>
      
      <div class="impulse-question">
        <label>Why do you need this right now?</label>
        <textarea id="user-reason" rows="3" placeholder="I need this because..." style="width:100%; margin-top:5px;"></textarea>
      </div>

      <div id="ai-response-area" style="display:none; margin: 15px 0; padding: 10px; background: #f0f0f5; border-left: 4px solid #6c5ce7; text-align: left;">
        <strong>Gemini says:</strong> <span id="ai-text">Thinking...</span>
      </div>

      <button id="consult-ai-btn" class="impulse-btn active" style="background-color: #6c5ce7;">Get AI Reality Check</button>
      <button id="unlock-btn" class="impulse-btn" style="background-color: #5cb85c; display:none;">Ignore Advice & Buy</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Event Listeners
  const consultBtn = document.getElementById('consult-ai-btn');
  const unlockBtn = document.getElementById('unlock-btn');
  const responseArea = document.getElementById('ai-response-area');
  const aiText = document.getElementById('ai-text');
  const userReason = document.getElementById('user-reason');

  consultBtn.addEventListener('click', () => {
    if(!userReason.value) {
      alert("Please enter a reason first!");
      return;
    }

    // UI Feedback
    consultBtn.disabled = true;
    consultBtn.innerText = "Analyzing...";
    responseArea.style.display = "block";

    // Send data to background script
    chrome.runtime.sendMessage({
      action: "analyzePurchase",
      productName: title,
      price: price,
      userReason: userReason.value
    }, (response) => {
      // Handle response
      aiText.innerText = response.advice;
      
      // Reveal the "Buy" button only AFTER the advice is given
      consultBtn.style.display = "none";
      unlockBtn.style.display = "block"; 
      unlockBtn.classList.add('active'); // Enable clicking
    });
  });

  unlockBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
}

// Detection Logic (Same as before)
function isCheckoutPage() {
  const url = window.location.href.toLowerCase();
  const bodyText = document.body.innerText.toLowerCase();
  const isCheckoutUrl = url.includes('checkout') || url.includes('payment') || url.includes('cart');
  const hasBuyButton = bodyText.includes('place order') || bodyText.includes('complete purchase') || bodyText.includes('pay now') || bodyText.includes('finish') || bodyText.includes('checkout');
  return isCheckoutUrl && hasBuyButton;
}

// Trigger logic
setTimeout(() => {
  if (isCheckoutPage()) triggerCooldown();
}, 2000);

