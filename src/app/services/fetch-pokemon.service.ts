import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/';
  private pokemonsSource = new BehaviorSubject<any[]>([]);
  pokemons$ = this.pokemonsSource.asObservable();
  private currentPokemonSource = new BehaviorSubject<any>(null);
  currentPokemon$ = this.currentPokemonSource.asObservable();

  constructor(private http: HttpClient) {}

  fetchPokemonData(pokemonId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}pokemon/${pokemonId}`);
  }

  fetchPokemonSpecies(pokemonId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}pokemon-species/${pokemonId}/`);
  }

  fetchEvolutionChain(url: string): Observable<any> {
    return this.http.get(url);
  }

  getEvolutionImages(pokemonId: number): Observable<string[]> {
    return this.fetchPokemonSpecies(pokemonId).pipe(
      switchMap(species => this.fetchEvolutionChain(species.evolution_chain.url)),
      map(chain => this.extractEvolutionIds(chain.chain)),
      switchMap(ids => forkJoin(ids.map(id => this.fetchPokemonData(id).pipe(
        map(pokemon => pokemon.sprites.other["official-artwork"].front_default)
      ))))
    );
  }

  addPokemon(pokemon: any): void {
    const currentValue = this.pokemonsSource.value;
    this.pokemonsSource.next([...currentValue, pokemon]);
  }

  loadAllPokemon(start: number, end: number): void {
    const pokemonIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    forkJoin(pokemonIds.map(id => this.fetchPokemonData(id))).subscribe(pokemons => {
      this.pokemonsSource.next(pokemons);
    });
  }

  setCurrentPokemon(pokemon: any): void {
    this.currentPokemonSource.next(pokemon);
  }

  private extractEvolutionIds(chain: any): number[] {
    let ids = [];
    let current = chain;

    do {
      let pokemonId = current.species.url.split('/').filter(Boolean).pop();
      ids.push(+pokemonId); // Das Plus-Zeichen konvertiert den String zu einer Zahl
      current = current.evolves_to[0];
    } while (current);

    return ids;
  }
}
