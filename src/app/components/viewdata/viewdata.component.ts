import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ExploreDataComponent } from '../home/home.component';

@Component({
  selector: 'app-viewdata',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ExploreDataComponent ,FormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './viewdata.component.html',
  styleUrls: ['./viewdata.component.css'],
})
export class ViewdataComponent implements OnInit {
  dataName?: string;
  paginatedData = new MatTableDataSource<any>(); // Use MatTableDataSource for mat-table
  searchText: string = '';
  selectedField: string = ''; // Default search field
  displayedColumns: string[] = ['name', 'email', 'app_id', 'createdAt', 'updatedAt'];

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Default items per page
  totalRecords: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.dataName = params.get('dataName')!;
      if (this.dataName) {
        this.loadData();
      }
    });
  }

  // Load data with pagination, search field, and search text
  loadData(page: number = 1): void {
    const token = localStorage.getItem('token');
    if (this.dataName && token) {
      const headers = { Authorization: `Bearer ${token}` };
      const limit = this.itemsPerPage;
      const searchText = this.searchText;
      const selectedField = this.selectedField;

      // Update API call to include searchText and selectedField
      this.http
        .get<any>(`http://localhost:3000/viewdata/${this.dataName}?page=${page}&limit=${limit}&searchText=${searchText}&selectedField=${selectedField}`, { headers })
        .subscribe((response) => {
          const { data, totalRecords } = response;
          this.paginatedData.data = data;
          this.totalRecords = totalRecords;
        }, (error) => {
          console.error('Failed to load data:', error);
        });
    }
  }

  // Handle search button click to trigger search
  onSearch(): void {
    this.loadData(1); // Trigger a new search, starting from page 1
  }

  // Handle pagination
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.loadData(this.currentPage);
  }

  // Method to show all data
  showAll(): void {
    this.searchText = ''; // Clear the search text
    this.itemsPerPage = 10; // Set a large number to display all records
    this.loadData(1);// Load data starting from page 1
    this.selectedField = ''; 
  }
}
