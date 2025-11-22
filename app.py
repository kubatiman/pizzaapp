from flask import Flask, jsonify, request, send_from_directory
import random
from pizza_generator import build_ideas

app = Flask(__name__, static_folder='static', static_url_path='')

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/pizzas')
def get_pizzas():
    count = request.args.get('count', default=3, type=int)
    # Limit count to avoid abuse
    count = max(1, min(count, 10))
    
    ideas = []
    for idea in build_ideas(count):
        ideas.append({
            'crust': idea.crust,
            'sauce': idea.sauce,
            'cheese': idea.cheese,
            'toppings': idea.toppings,
            'description': idea.describe()
        })
    
    return jsonify(ideas)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
