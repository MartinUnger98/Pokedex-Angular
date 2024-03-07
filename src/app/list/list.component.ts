import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../services/fetch-pokemon.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit{
  pokemons: any[] = [];
  subscription!: Subscription;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.pokemonService.loadAllPokemon(1, 151);
    this.subscription = this.pokemonService.pokemons$.subscribe(data => {
      this.pokemons = data;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe(); // Um Memory Leaks zu vermeiden
    }
  }
}
