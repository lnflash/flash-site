// Function to retrive bitcoin data every 60 seconds
async function fetchBitcoinPrice(count) {
  const btcTracker = document.getElementById("bitcoin-price");
  const urls = ["https://api.blink.sv/graphql", "https://api.api-ninjas.com/v1/bitcoin", "https://api.coindesk.com/v1/bpi/currentprice/BTC.json"];
  const keys = ["", "3hidiKMZHXcxRmJ0nwVgqQ==W6IfaDGnbQ7U4gOV", ""];
  let apiCount = count;

  if (btcTracker !== null || btcTracker !== "") {
    const url = urls[apiCount];
    let data = null;
    let response;
    try {
      if (apiCount < 1) {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            query: `query RealtimePrice($currency: DisplayCurrency) {realtimePrice(currency: $currency) {btcSatPrice {base}}}`,
            variables: {
              currency: "USD"
            }
          })
        });
      } else {
        response = await fetch(url, {
          headers: {
            "content-type": "application/json",
            "x-api-key": keys[apiCount],
          }
        });
      }
      if (!response.ok) {
        throw new Error(`URL: ${url}, Response status: ${response.status}`);
      }
      data = await response.json();

      if (data !== null) {
        let btcVal = document.getElementById('btc-value');
        let price;
        switch (apiCount) {
          case 0:
            price = data.data.realtimePrice.btcSatPrice.base;
            price = price / 1000000;
            break;
          case 1:
            price = data.price;
            price = parseFloat(price.split(",").join(""));
            break;
          case 2: 
            price = data.bpi.USD.rate;
            price = parseFloat(price.split(",").join(""));
            break;
        
          default:
            break;
        }
        price = price.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
        btcVal.classList.remove("animate_in");
        btcVal.classList.add("animate_out");
        setTimeout(() => {
          btcVal.classList.remove("animate_out");
          btcVal.classList.add("animate_in");
          btcVal.innerText = price;
        }, 520);

        setTimeout(() => {
          fetchBitcoinPrice(apiCount);
        }, 600000);
      }
    } catch (error) {
      console.error(error.message);
      apiCount++;
      if (apiCount < urls.length) {
        fetchBitcoinPrice(apiCount);
      }
    }
  }
}

// Wait for components to load before starting Bitcoin price tracking
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => fetchBitcoinPrice(0));
} else {
  // If DOM already loaded, start immediately
  fetchBitcoinPrice(0);
}
