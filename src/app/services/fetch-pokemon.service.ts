import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Pokemon } from '../models/pokemon.class';


@Injectable({
  providedIn: 'root'
})

export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/';
  public loadingNumber$  = new BehaviorSubject<number>(50);
  public lastLoadedId$ = new BehaviorSubject<number>(this.loadingNumber$.value);
  public pokemons$ = new BehaviorSubject<any[]>([]);
  public allPokemons$ = new BehaviorSubject<Pokemon[]>([]);
  public noPokemonFound$ = this.pokemons$.pipe(map(pokemons => pokemons.length === 0));
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
  public currentGen$ = new BehaviorSubject<number>(1);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  private closeOverlaySubject = new Subject<void>();
  public inputValue$ = new BehaviorSubject<string>('');
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
    this.isLoading$.next(true);
    const pokemonIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    forkJoin(pokemonIds.map(id => this.fetchPokemonData(id))).subscribe(pokemons => {
      this.updateLastLoadedId(end);
      const currentPokemons = this.pokemons$.value;
      this.allPokemons$.next([...currentPokemons, ...pokemons]);
      this.pokemons$.next([...currentPokemons, ...pokemons]);
      this.isLoading$.next(false);
    });
  }


  setAllPokemons(pokemons: Pokemon[]): void {
    this.allPokemons$.next(pokemons);
  }


  updateLastLoadedId(newLastId: number): void {
    this.lastLoadedId$.next(newLastId);
  }


  clearAllPokemon() {
    this.pokemons$.next([]);
  }


  updateCurrentPokemon(action: 'next' | 'previous'): void {
    const currentPokemon = this.currentPokemon$.value;
    if (!currentPokemon) return;
    const direction = action === 'next' ? 1 : -1;
    const newId = Math.max(1, currentPokemon.id + direction);
    const gens = this.gens$.getValue();
    const currentGen = `gen${this.currentGen$.getValue()}`;
    if (newId <= this.lastLoadedId$.getValue() && newId >= gens[currentGen].start) {
      this.fetchPokemonData(newId).subscribe(pokemon => this.setCurrentPokemon(pokemon));
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


  updateCurrentGen(gen: number) {
    this.currentGen$.next(gen);
  }


  triggerCloseOverlay() {
    this.closeOverlaySubject.next();
  }


  onCloseOverlay() {
    return this.closeOverlaySubject.asObservable();
  }

  filterPokemons(searchTerm: string): void {
    this.inputValue$.next(searchTerm);
    if (searchTerm) {
      const filtered = this.allPokemons$.value.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.pokemons$.next(filtered);
    } else {
      this.pokemons$.next(this.allPokemons$.value);
    }
  }


}
