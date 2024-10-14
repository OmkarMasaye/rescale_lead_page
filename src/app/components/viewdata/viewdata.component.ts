import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { ExploreDataComponent } from '../home/home.component';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-viewdata',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ExploreDataComponent],
  templateUrl: './viewdata.component.html',
  styleUrls: ['./viewdata.component.css'],
})
export class ViewdataComponent implements OnInit {
  dataName?: string;
  data: any[] = [];
  filteredData: any[] = [];
  searchQuery: string = '';
  // searchTimeout: any;
  searchQuerySubject: Subject<string> = new Subject<string>();
  searchQuerySubscription: any;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedData: any[] = [];
  totalPages: number = 0;
  totalRecords: number = 0;

  // Sorting state
  // sortOrder: string = 'asc';  
  sortDropdownOpen = false; 
  sortOrders: { [key: string]: 'asc' | 'desc' } = {};;  

  // Pagination window properties
  maxPagesToShow: number = 10; // Limit to showing 10 page numbers at a time
  startPage: number = 1; // Start of the page window
  endPage: number = this.maxPagesToShow; // End of the page window

  defaultKeys: string[] = ['_id', 'name', 'email'];
  expandedItems: Set<number> = new Set();
  expandedItemId: number | null = null;  // Store the expanded item ID
  
  dropdownOpen = false;
  selectedFormat: 'json' | 'csv' | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.dataName = params.get('dataName')!;
      if (this.dataName) {
        this.loadData();
      } else {
        console.error('Data name is null or undefined');
      }
    });
    this.searchQuerySubscription = this.searchQuerySubject
    .pipe(debounceTime(1000)) 
    .subscribe((searchQuery) => {
      this.currentPage = 1; // Reset to first page when performing search
      this.loadData();  // Trigger server-side search with current page
    });
  }

  loadData(page: number = 1): void {
    const token = localStorage.getItem('token');
    if (this.dataName && token) {
      const headers = { Authorization: `Bearer ${token}` };  // Authorization header with token
      const limit = this.itemsPerPage; 
      const search = this.searchQuery;
      const sortOrder = this.sortOrders[this.dataName] || 'asc'; 

      // Construct the API endpoint with page, limit, search, and sortOrder as query parameters
      this.http
        .get<any>(
          `https://asia-south1-ads-ai-101.cloudfunctions.net/card_api/viewdata/${this.dataName}?page=${page}&limit=${limit}&search=${search}&sortOrder=${sortOrder}`,
          { headers }
        )
        .subscribe(
          (response) => {
            const { data, totalRecords, totalPages, currentPage } = response;
            
            
            // Filter out unnecessary fields (e.g., 'q', 'modifiedBy', '__v')
            this.data = data.map((item: any) => {
              const { q,d, modifiedBy, __v,data, ...rest } = item;
              return rest;
            });
  
            // Copy the data to filteredData for search and sorting operations
            this.filteredData = [...this.data];
  
            // Update pagination details
            this.totalPages = totalPages;
            this.totalRecords = totalRecords;
            this.currentPage = currentPage;
  
            // Update paginated data based on the current page
            this.updatePaginatedData();
            this.updatePageWindow();
          },
          (error) => {
            console.error('Failed to load data:', error);
          }
        );
    } else {
      console.error('Data name or token is null or undefined, cannot load data');
    }
  }

  search(): void {
    this.searchQuerySubject.next(this.searchQuery);
  }

  ngOnDestroy(): void {
    this.searchQuerySubscription.unsubscribe();
  }

  toggleSortDropdown() {
    this.sortDropdownOpen = !this.sortDropdownOpen;
  }

  // Sort data by time, depending on the order selected (asc or desc)
  onSortByTime(order: 'asc' | 'desc'): void {
    if (this.dataName) {
      this.sortOrders[this.dataName] = order;  // Store sort order for the specific dataset
      this.currentPage = 1;  // Reset to first page when sorting
      this.loadData();  // Reload data with the dataset-specific sorting order
    }
    this.sortDropdownOpen = false;  // Close the dropdown after selecting
  }


  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  isDownloading = false;
  downloadData(format: 'json-download' | 'csv'): void {
    this.isDownloading = true;
    const token = localStorage.getItem('token');
    if (this.dataName && token) {
        const headers = { Authorization: `Bearer ${token}` };
        const sortOrder = this.sortOrders[this.dataName] || 'desc';  // Get current sort order
        const sortBy = 'createdAt';  // You can update this to whatever field you are sorting by

        this.http
            .get(
                `https://asia-south1-ads-ai-101.cloudfunctions.net/card_api/viewdata/${this.dataName}?format=${format}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
                { responseType: 'blob', headers }
            )
            .subscribe(
                (blob) => {
                    const fileExtension = format === 'json-download' ? 'json' : 'csv';
                    const fileName = `${this.dataName}.${fileExtension}`;
                    saveAs(blob, fileName);
                    this.isDownloading = false;
                    this.dropdownOpen = false;
                },
                (error) => {
                    this.isDownloading = false;
                    console.error('Failed to download data:', error);
                }
            );
    } else {
        console.error('Data name or token is null or undefined, cannot download data');
    }
}


  getObjectKeys(item: any): string[] {
    return this.expandedItems.has(item._id) ? Object.keys(item) : this.defaultKeys;
  }

  toggleItemVisibility(itemId: number): void {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  updatePaginatedData(): void {
    const startIndex = 0;
    const endIndex = 10;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex); // Update with the new pagination logic
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;  // Ensure the page is set
      this.loadData(page);  // Fetch the requested page with current sortOrder
    }
  }

  updatePageWindow(): void {
    const halfWindow = Math.floor(this.maxPagesToShow / 2);
    
    if (this.totalPages <= this.maxPagesToShow) {
      this.startPage = 1;
      this.endPage = this.totalPages;
    } else if (this.currentPage <= halfWindow) {
      this.startPage = 1;
      this.endPage = this.maxPagesToShow;
    } else if (this.currentPage + halfWindow >= this.totalPages) {
      this.startPage = this.totalPages - this.maxPagesToShow + 1;
      this.endPage = this.totalPages;
    } else {
      this.startPage = this.currentPage - halfWindow;
      this.endPage = this.currentPage + halfWindow;
    }
  }

  onNext(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);  // Fetch next page
    }
  }

  onPrevious(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);  // Fetch previous page
    }
  }

  onFirst(): void {
    this.goToPage(1);
  }

  onLast(): void {
    this.goToPage(this.totalPages);
  }
}
