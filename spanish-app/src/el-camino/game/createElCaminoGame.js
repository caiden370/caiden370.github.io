import Phaser from "phaser";
import ElCaminoScene from "./ElCaminoScene";

export function createElCaminoGame(parent) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: parent.clientWidth || window.innerWidth,
    height: parent.clientHeight || window.innerHeight,
    backgroundColor: "#111827",
    pixelArt: true,
    roundPixels: true,
    scene: [ElCaminoScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: parent.clientWidth || window.innerWidth,
      height: parent.clientHeight || window.innerHeight
    },
    render: {
      antialias: false
    }
  });
}
