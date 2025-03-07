import { Routes } from '@angular/router';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { ErrorComponent } from './components/error/error.component';
import { LoginComponent } from './components/login/login.component';
import { SearchComponent } from './components/search/search.component';
import { SurveyComponent } from './components/survey/survey.component';
import { AccountSetupComponent } from './components/account-setup/account-setup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChatComponent } from './components/chat/chat.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'account-setup',
        component: AccountSetupComponent
    },
    {
        path: 'chat',
        component: ChatComponent
    },
    {
        path: 'chatList',
        component: ChatListComponent
    },
    {
        path: 'survey',
        component: SurveyComponent
    },
    {
        path: 'contact-us',
        component: ContactUsComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'myProfile',
        component: MyProfileComponent,
        canActivate: [authGuard]
    },
    {
        path: '404',
        component: ErrorComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'search',
        component: SearchComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: '404'
    }
];