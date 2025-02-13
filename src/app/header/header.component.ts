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
  secondScreenExist: boolean = false;

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

  async openOnSecondScreen() {
    if ('getScreenDetails' in window) {
      try {
        const screenDetails: any = await (window as any).getScreenDetails();
        const screens = screenDetails.screens;
        const currentScreen = screenDetails.currentScreen;
        const secondScreen = screens.find((screen: Screen) => screen !== currentScreen);

        if (secondScreen) {
        const sortedScreens = [...screens].sort((a: Screen, b: Screen) => a.width - b.width);
        const smallScreen = sortedScreens[0];
        const largeScreen = sortedScreens[sortedScreens.length - 1];


        window.open(window.location.href, '_blank',
          `left=${smallScreen.availLeft},top=${smallScreen.availTop},width=${smallScreen.availWidth},height=${smallScreen.availHeight}`);

        const halfWidth = largeScreen.availWidth / 2;
        window.open(window.location.href, '_blank',
          `left=${largeScreen.availLeft},top=${largeScreen.availTop},width=${halfWidth},height=${largeScreen.availHeight}`);
        window.open(window.location.href, '_blank',
          `left=${largeScreen.availLeft + halfWidth},top=${largeScreen.availTop},width=${halfWidth},height=${largeScreen.availHeight}`);
        } else {
          alert('Es wurde kein zweiter Bildschirm gefunden.');
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Bildschirmdetails:', error);
      }
    } else {
      alert('Die Window Management API wird in diesem Browser nicht unterstützt.');
    }
  }


  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
