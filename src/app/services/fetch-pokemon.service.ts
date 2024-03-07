import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
  private pokemonsSource = new BehaviorSubject<any[]>([]);
  pokemons$ = this.pokemonsSource.asObservable();

  constructor(private http: HttpClient) {}

  fetchPokemonData(pokemonId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${pokemonId}`);
  }

  // Hinzufügen von Pokémon-Daten zum BehaviorSubject
  addPokemon(pokemon: any) {
    const currentValue = this.pokemonsSource.value;
    this.pokemonsSource.next([...currentValue, pokemon]);
  }

  // Laden aller Pokémon innerhalb eines Bereichs
  loadAllPokemon(start: number, end: number) {
    for (let i = start; i <= end; i++) {
      this.fetchPokemonData(i).subscribe(pokemon => {
        this.addPokemon(pokemon);
      });
    }
  }
}
