"""Generate whimsical pizza combinations for adventurous eaters."""

from __future__ import annotations

import argparse
import random
from dataclasses import dataclass
from typing import Iterable, List


@dataclass(frozen=True)
class PizzaIdea:
    """A playful description of a pizza."""

    crust: str
    sauce: str
    cheese: str
    toppings: List[str]

    def describe(self) -> str:
        topping_text = ", ".join(self.toppings) if self.toppings else "no extra toppings"
        return (
            f"Start with a {self.crust} crust,"
            f" spread {self.sauce}, add {self.cheese},"
            f" and finish with {topping_text}."
        )


CRUSTS = [
    "charcoal-infused sourdough",
    "garlic-stuffed deep dish",
    "crispy cauliflower",
    "herb-flecked thin crust",
    "pretzel twist",
]

SAUCES = [
    "sun-dried tomato pesto",
    "roasted garlic alfredo",
    "smoky chipotle marinara",
    "sweet balsamic reduction",
    "truffle-infused olive oil",
]

CHEESES = [
    "buffalo mozzarella",
    "aged provolone",
    "vegan cashew ricotta",
    "smoked gouda",
    "fontina blend",
]

TOPPINGS = [
    "candied jalapeños",
    "charred pineapple",
    "crispy sage leaves",
    "fig jam drizzle",
    "roasted maitake mushrooms",
    "pickled red onions",
    "toasted pistachios",
    "honey-glazed pancetta",
    "black garlic chips",
    "lemon zest",
]


def build_ideas(count: int, rng: random.Random | None = None) -> Iterable[PizzaIdea]:
    """Generate a collection of imaginative pizza ideas."""

    if count < 1:
        raise ValueError("count must be at least 1")

    rng = rng or random.Random()

    for _ in range(count):
        toppings = rng.sample(TOPPINGS, k=rng.randint(2, 4))
        yield PizzaIdea(
            crust=rng.choice(CRUSTS),
            sauce=rng.choice(SAUCES),
            cheese=rng.choice(CHEESES),
            toppings=sorted(toppings),
        )


def parse_args(argv: List[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "count",
        nargs="?",
        type=int,
        default=3,
        help="How many pizza ideas to generate (default: 3)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Seed the random generator for reproducible pizzas.",
    )
    return parser.parse_args(argv)


def main(argv: List[str] | None = None) -> None:
    args = parse_args(argv)
    rng = random.Random(args.seed) if args.seed is not None else None

    for index, idea in enumerate(build_ideas(args.count, rng), start=1):
        print(f"Pizza #{index}: {idea.describe()}")


if __name__ == "__main__":
    main()
