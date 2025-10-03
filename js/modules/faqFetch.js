// This is the JS file for the FAQ section

class AddFaq{
  constructor(source, target) {
    this.target = target;
    this.count = 0;
    this.content = "";
    fetch(source)
    .then(response => response.json())
    .then(data => {
      this.faqItems = data.faq;
      this.generateFaq();
    })
    .catch(error => console.log("FAQ Error: " + error));
  }
  generateFaq() {
    this.faqItems.forEach(item => {
      this.content += `
        <div class="accordion-tab" data-active="inactive">
          <h3 id="faq${this.count}-label">
            <button class="accordion-head" aria-controls="faq${this.count}-answer" aria-expanded="false">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true">
                <use href="#plus" class="plus"></use>
                <use href="#minus" class="minus"></use>
              </svg>
              <span class="accordion-label">${item.question}</span>
            </button>
          </h3>
          <div class="accordion-body" id="faq${this.count}-answer" aria-labelledby="faq${this.count}-label" role="region" aria-hidden="true">
            ${item.answer}
          </div>
        </div>`;
      this.count++;
    });
    $(this.target).html(this.content);
  }
}
  