import { Component } from '@angular/core';
import { PokemonService } from '../services/fetch-pokemon.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  constructor(private  pokemonService: PokemonService) {}

  routeTo(router_link: string) {
    this.pokemonService.routeTo(router_link);
  }
}
