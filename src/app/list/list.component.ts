import { Component, OnDestroy, OnInit } from '@angular/core';
import { PokemonService } from '../services/fetch-pokemon.service';
import { Subject, takeUntil } from 'rxjs';
import { Generations } from '../models/genarations.class';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy{
  pokemons: any[] = [];
  currentGen: number = 1;
  isLoading: boolean = false;
  private destroyed$ = new Subject<void>();
  gens = new Generations();

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.loadInitialPokemons();
    this.subscribeObservables();
  }

  subscribeObservables() {
    this.pokemonService.gens$.pipe(takeUntil(this.destroyed$)).subscribe((gens) => {
      this.gens = gens;
    });

    this.pokemonService.pokemons$.pipe(takeUntil(this.destroyed$)).subscribe((pokemons) =>{
      this.pokemons = pokemons;
    });
  }

  loadInitialPokemons() {
    this.pokemonService.loadAllPokemon(1, 20);
  };

  displayOverlay(pokemon: any): void {
    this.pokemonService.setCurrentPokemon(pokemon);
  }

  loadMore() {
    const gensKey = `gen${this.currentGen}` as keyof typeof this.gens;
    const currentGen = this.gens[gensKey];
    const lastId = this.pokemonService.getCurrentLastLoadedId();

    let newStartId = lastId + 1;
    let newEndId = newStartId + 19;

    if (newEndId > currentGen.end) {
        newEndId = currentGen.end;
    }

    if (newStartId <= currentGen.end) {
        this.pokemonService.loadAllPokemon(newStartId, newEndId);
    }
}


  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
