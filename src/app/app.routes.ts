import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'account-setup',
    loadComponent: () => import('./components/account-setup/account-setup.component').then(m => m.AccountSetupComponent)
  },
  {
    path: 'chat/:conversationId/:recipientId',
    loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'chatList',
    loadComponent: () => import('./components/chat-list/chat-list.component').then(m => m.ChatListComponent)
  },
  {
    path: 'survey',
    loadComponent: () => import('./components/survey/survey.component').then(m => m.SurveyComponent)
  },
  {
    path: 'contact-us',
    loadComponent: () => import('./components/contact-us/contact-us.component').then(m => m.ContactUsComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'myProfile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/my-profile/my-profile.component').then(m => m.MyProfileComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./components/error/error.component').then(m => m.ErrorComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'user-bio/:id',
    loadComponent: () => import('./components/user-bio/user-bio.component').then(m => m.UserBioComponent)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];