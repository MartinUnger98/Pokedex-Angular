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
  currentGen!: number;
  isLoading!: boolean;
  loadingNumber!: number;
  noPokemonFound!: boolean;
  inputValue!: string;
  private destroyed$ = new Subject<void>();
  gens = new Generations();

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.subscribeObservables();
    this.loadInitialPokemons();
  }

  subscribeObservables() {
    this.pokemonService.gens$.pipe(takeUntil(this.destroyed$)).subscribe(gens => {
      this.gens = gens;
    });

    this.pokemonService.pokemons$.pipe(takeUntil(this.destroyed$)).subscribe(pokemons => {
      this.pokemons = pokemons;
    });

    this.pokemonService.currentGen$.pipe(takeUntil(this.destroyed$)).subscribe(currentGen => {
      this.currentGen = currentGen;
    });

    this.pokemonService.isLoading$.pipe(takeUntil(this.destroyed$)).subscribe(isLoading => {
      this.isLoading = isLoading;
    });

    this.pokemonService.loadingNumber$.pipe(takeUntil(this.destroyed$)).subscribe(loadingNumber => {
      this.loadingNumber = loadingNumber;
    });

    this.pokemonService.noPokemonFound$.pipe(takeUntil(this.destroyed$)).subscribe(noPokemonFound => {
      this.noPokemonFound = noPokemonFound;
    });

    this.pokemonService.inputValue$.pipe(takeUntil(this.destroyed$)).subscribe(inputValue => {
      this.inputValue = inputValue;
    });
  }

  loadInitialPokemons() {
    this.pokemonService.loadAllPokemon(1, this.loadingNumber);
  };

  displayOverlay(pokemon: any): void {
    this.pokemonService.setCurrentPokemon(pokemon);
  }

  loadMore() {
    const gensKey = `gen${this.currentGen}` as keyof typeof this.gens;
    const currentGen = this.gens[gensKey];
    const lastId = this.pokemonService.getCurrentLastLoadedId();

    let newStartId = lastId + 1;
    let newEndId = newStartId + (this.loadingNumber - 1);

    if (newEndId > currentGen.end) {
        newEndId = currentGen.end;
    }

    if (newStartId <= currentGen.end) {
        this.pokemonService.loadAllPokemon(newStartId, newEndId);
    }
  }


  isLoadMoreVisible(): boolean {
    const gensKey = `gen${this.currentGen}` as keyof typeof this.gens;
    const currentGen = this.gens[gensKey];
    const lastId = this.pokemonService.getCurrentLastLoadedId();
    return lastId < currentGen.end;
  }


  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
