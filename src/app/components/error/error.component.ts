import { Component } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-error',
    imports: [MaterialModule, RouterModule],
    templateUrl: './error.component.html',
    styleUrl: './error.component.css'
})
export class ErrorComponent {

}
