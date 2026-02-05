const BACKEND_URL = "https://impulse-guard.vercel.app/analyze";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzePurchase") {

    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: request.productName,
        price: request.price,
        userReason: request.userReason
      })
    })
    .then(res => res.json())
    .then(data => {
      sendResponse(data);
    })
    .catch(err => {
      sendResponse({ success: false, advice: "Backend offline" });
    });

    return true;
  }
});
