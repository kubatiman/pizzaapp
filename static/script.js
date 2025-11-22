document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const pizzaGrid = document.getElementById('pizza-grid');

    // Initial load
    fetchPizzas();

    generateBtn.addEventListener('click', () => {
        fetchPizzas();
    });

    async function fetchPizzas() {
        // Show loading state
        pizzaGrid.innerHTML = '<div class="loading">Heating up the oven... 🍕</div>';

        try {
            const response = await fetch('/api/pizzas?count=3');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const pizzas = await response.json();
            renderPizzas(pizzas);
        } catch (error) {
            console.error('Error fetching pizzas:', error);
            pizzaGrid.innerHTML = '<div class="loading">Oops! The oven broke. Try again later. 🔥</div>';
        }
    }

    function renderPizzas(pizzas) {
        pizzaGrid.innerHTML = '';

        pizzas.forEach((pizza, index) => {
            const card = document.createElement('div');
            card.className = 'pizza-card';
            card.style.animationDelay = `${index * 100}ms`;

            const toppingsHtml = pizza.toppings.map(t =>
                `<span class="topping-tag">${t}</span>`
            ).join('');

            card.innerHTML = `
                <div class="card-header">
                    <span class="pizza-number">Pizza #${index + 1}</span>
                    <span class="pizza-icon">🍕</span>
                </div>
                
                <div class="ingredient-group">
                    <span class="label">Crust</span>
                    <div class="value">${pizza.crust}</div>
                </div>
                
                <div class="ingredient-group">
                    <span class="label">Sauce</span>
                    <div class="value">${pizza.sauce}</div>
                </div>
                
                <div class="ingredient-group">
                    <span class="label">Cheese</span>
                    <div class="value">${pizza.cheese}</div>
                </div>
                
                <div class="ingredient-group">
                    <span class="label">Toppings</span>
                    <div class="toppings-list">
                        ${toppingsHtml}
                    </div>
                </div>
            `;

            pizzaGrid.appendChild(card);
        });
    }
});
