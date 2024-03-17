import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Generations } from '../models/genarations.class';
import { PokemonService } from '../services/fetch-pokemon.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  gens = new Generations();
  currentGen!: number;
  loadingNumber!: number;
  searchTerm: string = '';

  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.subscribeObservables();
  }

  subscribeObservables() {
    this.pokemonService.gens$.pipe(takeUntil(this.destroyed$)).subscribe((gens) => {
      this.gens = gens;
    });

    this.pokemonService.currentGen$.pipe(takeUntil(this.destroyed$)).subscribe((currentGen) => {
      this.currentGen = currentGen;
    });

    this.pokemonService.loadingNumber$.pipe(takeUntil(this.destroyed$)).subscribe(loadingNumber => {
      this.loadingNumber = loadingNumber;
    });
  }

  loadGen(gen: number) {
    this.closeTheOverlay();
    this.clearSearchTerm();
    let start = this.gens['gen' + gen].start;
    let end = start + this.loadingNumber - 1;
    this.pokemonService.updateCurrentGen(gen);
    this.pokemonService.clearAllPokemon();
    this.pokemonService.loadAllPokemon(start, end);
  };


  closeTheOverlay() {
    this.pokemonService.triggerCloseOverlay();
  }


  filterPokemons(): void {
    this.pokemonService.filterPokemons(this.searchTerm);
  }


  clearSearchTerm() {
    this.searchTerm = '';
    this.pokemonService.inputValue$.next(this.searchTerm);
  }


  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
