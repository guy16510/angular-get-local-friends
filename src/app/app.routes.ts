import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { ErrorComponent } from './components/error/error.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'contact-us',
        component: ContactUsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard]
    },
    {
        path: '404',
        component: ErrorComponent
    },
    {
        path: 'login',
        component: AuthComponent
    },
    {
        path: '**',
        redirectTo: '404'
    }
];