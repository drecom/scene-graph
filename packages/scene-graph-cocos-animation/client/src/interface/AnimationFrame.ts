export default interface AnimationFrame {
  frame: number;
  value: { [key: string]: number };
  curve: number[] | string;
}
