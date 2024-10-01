import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class ExploreDataComponent implements OnInit {
  activeItem: string | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.navigateToData('skoda'); // Navigate to Tata on initialization
  }
  
  navigateToData(dataName: string): void {
    this.router.navigate(['/viewdata', dataName]);
    this.activeItem = dataName;
  }
}