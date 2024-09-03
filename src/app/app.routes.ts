import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { ExploreDataComponent } from './components/explore-data/explore-data.component';
import { ViewdataComponent } from './components/viewdata/viewdata.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'home', component: HomeComponent },
    { path: 'exploreData', component: ExploreDataComponent },
    { path: 'viewdata/:dataName', component: ViewdataComponent },
    { path:'',redirectTo:"/home",pathMatch:"full"},
    { path: '**', component: NotfoundComponent }
];
