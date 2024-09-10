import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class ExploreDataComponent {
  
  constructor(private router: Router) { }
   
  navigateToData(dataName: string): void {
    
    this.router.navigate(['/viewdata', dataName]);
    
  }
}
