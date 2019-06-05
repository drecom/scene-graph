export { };

declare global {
  interface String {
    fillRight(word: string, count: number): string;
    fillLeft(word: string, count: number): string;
  }
}
String.prototype.fillLeft = function (word: string, count: number): string {
  let input = this as string;

  // check arg
  if (word.length === 0) {
    return input;
  }

  // ERROR
  if (word.length > 1) {
    throw new Error('[fillText.length] the arg allow \'length <= 1\' -> \
    (inputed: ${ word.length } )');
  }
  if (count < 0) {
    throw new Error('[fillText.count] the arg allow \'integer\' and \'over than 0\' -> \
    (inputed: + ${ count } + )');
  }

  input = word.repeat(count) + input;
  return input.slice(-count);
};
String.prototype.fillRight = function (word: string, count: number): string {
  let input = this as string;
  // check arg
  if (word.length === 0) {
    return input;
  }

  // ERROR
  if (word.length > 1) {
    throw new Error('[fillText.length] the arg allow \'length <= 1\' ->\
     (inputed: ${ word.length })');
  }
  if (count < 0) {
    throw new Error('[fillText.count] the arg allow \'integer\' and \'over than 0\' -> \
    (inputed: ${ count })');
  }

  input += word.repeat(count);
  return input.substr(0, count);
};

export default function dummy() { }
