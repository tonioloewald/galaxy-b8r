# Purpose-Driven Star System Generation

Typically procedural star-system generation focuses on generating a plausible
physical representation of a star system, which given reasonable scientific
assumptions tends not to be very interesting most of the time.

The goal here is to apply the principle of "design for effect", i.e. to start
with intended outcomes and work backwards.

E.g. suppose you have a story that involves exploring a spooky place and finding
something valuable, then going to a merchant on your current home world and trying to 
sell the artifact but being attacked (by people who will turn out to be allies) and all of you
being thrown into a prison from which you need to escape. Then going to
another less reputable merchant in a less reputable place and trying to sell 
the treasure, having the treasure taken away from you and then discovering the 
person who took it from you wants to use it as a weapon to destroy your home world,
and then going back to the homeworld to save it.

So, you need:

1. spooky place
2. homeworld (if not already designed)
3. prison
4. disreputable, dangerous place

The idea is that you might decide that you want a planet with an alien ruin on it,
a homeworld, a prison planet, and a disreputable, dangerous place.

It might follow that you want the first planet to be hostile but survivable,
the homeworld to be really pleasant, the prison planet to be hostile but survivable,
and the disreputable, dangerous place to be survivale but really exotic.

So, you might want to be able to do something like say:

1. Give me a borderline habitable planet and wrap a star system around it.
2. Give me an earthlike planet and make it the homeworld of a major starfaring civilization
3. Give me a "prison planet"
4. Give me a "pirate base" in an unlikely place

The generator would need to be smart enough to take these instructions and get you
most of the way there, e.g. a borderline habitable planet essentially has the same
constraints -- somewhat relaxed -- as a habitable planet, but add a few major problems
like terrible weather, geological activity, ravenous wildlife, problematic atmosphere,
too little water, too little land, uncomfortably hot or cold, and so on.

An earthlike planet is easy. Just take earth's characteristics and perturb them
a bit.

A prison planet could be artificial (e.g. a hollowed out asteroid) or a natural prison
(e.g. a planet that's basically uninhabitable but has one or more isolated survivable
bits).

A pirate base in an unlikely place is an excuse to be creative. (Inside the skull of a
dead god, anyone?)

In more concrete terms, instead of the usual chain of reasoning, which tends to go something
like this:

stellar type and age -> 
  collection of planets -> 
    size and composition of planet + insolation -> 
      atmosphere, surface type, resources ->
        what do I do with this?

You start with what you want or need:

purpose of star system ->
  required astronomical body (e.g. rocky planet with water and atmosphere) ->
    required atmosphere, type, resources ->
      size and composition + insolation ->
        stellar type and age

The question then becomes, what kinds of things do we tend to need?

As a rough starting point:

- Places to restock (food, water, air, fuel)
- Places to exploit (e.g. mine)
- Obtain missions
- Buy stuff
- Sell stuff
- Explore


