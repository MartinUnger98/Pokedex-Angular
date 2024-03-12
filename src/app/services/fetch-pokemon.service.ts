interface Pokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/';
  public lastLoadedId$ = new BehaviorSubject<number>(20);
  public pokemons$ = new BehaviorSubject<any[]>([]);
  public currentPokemon$ = new BehaviorSubject<any>(null);
  public gens$ = new BehaviorSubject<any>({
    gen1: { start: 1, end: 151 },
    gen2: { start: 152, end: 251 },
    gen3: { start: 252, end: 386 },
    gen4: { start: 387, end: 493 },
    gen5: { start: 494, end: 649 },
    gen6: { start: 650, end: 721 },
    gen7: { start: 722, end: 809 },
  });
  private extractEvolutionIds(chain: any): number[] {
    let ids = [];
    let current = chain;

    do {
      let pokemonId = current.species.url.split('/').filter(Boolean).pop();
      ids.push(+pokemonId);
      current = current.evolves_to[0];
    } while (current);

    return ids;
  }

  constructor(private http: HttpClient) {}

  fetchPokemonData(pokemonId: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}pokemon/${pokemonId}`);
  }


  fetchPokemonSpecies(pokemonId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}pokemon-species/${pokemonId}/`);
  }


  fetchEvolutionChain(url: string): Observable<any> {
    return this.http.get(url);
  }


  loadAllPokemon(start: number, end: number): void {
    const pokemonIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    forkJoin(pokemonIds.map(id => this.fetchPokemonData(id))).subscribe(pokemons => {
      this.updateLastLoadedId(end);
      const currentPokemons = this.pokemons$.value;
      this.pokemons$.next([...currentPokemons, ...pokemons]);
    });
  }


  updateLastLoadedId(newLastId: number): void {
    this.lastLoadedId$.next(newLastId);
  }


  updateCurrentPokemon(action: 'next' | 'previous'): void {
    const currentPokemon = this.currentPokemon$.value;
    if (currentPokemon) {
      const currentId = currentPokemon.id;
      let newId = action === 'next' ? currentId + 1 : currentId - 1;
      if (newId < 1) newId = 1;
      if (newId < this.lastLoadedId$.value + 1) {
        this.fetchPokemonData(newId).subscribe(pokemon => {
          this.setCurrentPokemon(pokemon);
        });
      }
    }
  }


  setCurrentPokemon(pokemon: any): void {
    this.currentPokemon$.next(pokemon);
  }


  getCurrentLastLoadedId(): number {
    return this.lastLoadedId$.getValue();
  }


  getEvolutionImages(pokemonId: number): Observable<string[]> {
    return this.fetchPokemonSpecies(pokemonId).pipe(
      switchMap(species => this.fetchEvolutionChain(species.evolution_chain.url)),
      map(chain => this.extractEvolutionIds(chain.chain)),
      switchMap(ids => forkJoin(ids.map(id => this.fetchPokemonData(id)))),
      map(pokemons => pokemons.map(pokemon => pokemon.sprites.other["official-artwork"].front_default))
    );
  }
}
