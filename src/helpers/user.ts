import animals from "./animals.json";
import adjectives from "./adjectives.json";

function getRandomArbitrary(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getUsername = () => {
  const animalsLength = animals.length;
  const adjectivesLength = adjectives.length;

  const animalIndex = getRandomArbitrary(0, animalsLength - 1);
  const adjectivesIndex = getRandomArbitrary(0, adjectivesLength - 1);

  const adjective = capitalizeFirstLetter(adjectives[adjectivesIndex]);
  const animal = animals[animalIndex];
  return `${adjective} ${animal}`;
};

export function getDarkColor() {
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += Math.floor(Math.random() * 10);
  }
  return color;
}
