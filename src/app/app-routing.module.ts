import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  {path: '', component: ListComponent},
  /* {path: 'privacy-policy', component: PrivacyPolicyComponent},
  {path: 'imprint', component: ImprintComponent}, */
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
