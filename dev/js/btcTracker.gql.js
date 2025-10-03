// Function to fetch BTC price from the GraphQL endpoint
function fetchBtcPrice() {
  fetch("https://api.blink.sv/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query RealtimePrice($currency: DisplayCurrency) {
        realtimePrice(currency: $currency) {
          btcSatPrice {
            base
          }
        }
      }`,
      variables: { currency: "USD" },
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Extract the base price (in satoshis)
      const satoshiPrice = data.data.realtimePrice.btcSatPrice.base;
      // Convert satoshis to USD (1 BTC = 100,000,000 satoshis)
      const usdPrice = satoshiPrice / 100000000;
      // Update the ticker value in the DOM (formatted to 2 decimal places)
      document.getElementById("btc-value").textContent = usdPrice.toFixed(2);
    })
    .catch((error) => console.error("Error fetching BTC price:", error));
}

// Initial fetch on page load

fetchBtcPrice();

// Refresh the price every 60 seconds
setInterval(fetchBtcPrice, 60000);
