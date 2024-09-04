import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';

import { NotfoundComponent } from './components/notfound/notfound.component';
import { ExploreDataComponent } from './components/explore-data/explore-data.component';
import { ViewdataComponent } from './components/viewdata/viewdata.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'exploreData', component: ExploreDataComponent,canActivate: [authGuard] },
    { path: 'viewdata/:dataName', component: ViewdataComponent,canActivate: [authGuard] },
    { path:'',redirectTo:"/login",pathMatch:"full"},
    { path: '**', component: NotfoundComponent }
];
