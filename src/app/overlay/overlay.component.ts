import { Component, Input, OnInit, HostListener } from '@angular/core';
import { PokemonService } from '../services/fetch-pokemon.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {
  @Input() pokemon: any;
  selectedTab: string = 'stats';
  evolutionImages: string[] = [];

  constructor(private pokemonService: PokemonService) { }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.pokemon) {
      switch (event.key) {
        case 'ArrowRight':
          this.updatePokemon('next');
          break;
        case 'ArrowLeft':
          this.updatePokemon('previous');
          break;
        case 'Escape':
          this.closeOverlay();
          break;
      }
    }
  };

  ngOnInit(): void {
    if (this.pokemon && this.pokemon.id) {
      this.loadEvolutionImages(this.pokemon.id);
    } else {
      this.pokemonService.currentPokemon$.pipe(
        switchMap(pokemon => {
          if (pokemon && pokemon.id) {
            this.pokemon = pokemon;
            return this.pokemonService.getEvolutionImages(pokemon.id);
          } else {
            return [];
          }
        })
      ).subscribe(images => {
        this.evolutionImages = images;
      }, error => {
        console.error('Fehler beim Laden der Evolutionsbilder:', error);
      });
    }
  }

  loadEvolutionImages(pokemonId: number) {
    this.pokemonService.getEvolutionImages(pokemonId).subscribe(images => {
      this.evolutionImages = images;
    }, error => {
      console.error('Fehler beim Laden der Evolutionsbilder:', error);
    });
  }

  selectTab(tabName: string) {
    this.selectedTab = tabName;
  }

  getTabClass(tabName: string): Object {
    return {
      [this.pokemon.types[0].type.name]: this.selectedTab === tabName,
      'colorWhite': this.selectedTab === tabName
    };
  }

  closeOverlay() {
    this.pokemon = 	null;
  }

  updatePokemon(action: 'next' | 'previous') {
    this.pokemonService.updateCurrentPokemon(action);
  }
}
