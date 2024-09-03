import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-explore-data',
  standalone: true,
  imports: [],
  templateUrl: './explore-data.component.html',
  styleUrl: './explore-data.component.css'
})
export class ExploreDataComponent {
  constructor(private router: Router) { }

  navigateToData(dataName: string): void {
    this.router.navigate(['/viewdata', dataName]);
  }
}
