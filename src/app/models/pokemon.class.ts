export class Pokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };

  constructor(id: number, name: string, artworkUrl: string) {
    this.id = id;
    this.name = name;
    this.sprites = {
      other: {
        "official-artwork": {
          front_default: artworkUrl
        }
      }
    };
  }
}
