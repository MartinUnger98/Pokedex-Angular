import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../services/fetch-pokemon.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit{
  pokemon: any;

  constructor(private pokemonService: PokemonService) { }

  ngOnInit() {
    this.pokemonService.getPokemon().subscribe(data => {
      this.pokemon = data;
      console.log(this.pokemon);
    });
  }


}
