import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { ExploreDataComponent } from '../home/home.component';



@Component({
  selector: 'app-viewdata',
  standalone: true,
  imports: [CommonModule, HttpClientModule,FormsModule,ExploreDataComponent],
  templateUrl: './viewdata.component.html',
  styleUrls: ['./viewdata.component.css'],
})
export class ViewdataComponent implements OnInit {
  dataName?: string;
  data: any[] = [];
  filteredData: any[] = [];
  searchQuery: string = '';
  sortDescending: boolean = true;
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedData: any[] = [];
  totalPages: number = 0;

  // Pagination window properties
  maxPagesToShow: number = 10; // Limit to showing 10 page numbers at a time
  startPage: number = 1; // Start of the page window
  endPage: number = this.maxPagesToShow; // End of the page window

  defaultKeys: string[] = ['_id', 'name', 'email'];
  expandedItems: Set<number> = new Set();
  expandedItemId: number | null = null;  // Store the expanded item ID

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
  }

  loadData(): void {
    const token = localStorage.getItem('token'); // Adjust based on how you store your token
    if (this.dataName && token) {
      const headers = { Authorization: `Bearer ${token}` }; // Include the token in the headers
      this.http
        .get<any[]>(
          `https://asia-south1-ads-ai-101.cloudfunctions.net/card_api/viewdata/${this.dataName}`,
          { headers }
        )
        .subscribe(
          (data) => {
            this.data = data.map(item => {
              const { q,modifiedBy,__v ...rest } = item;
              return rest;
            });
            this.filteredData = [...this.data];
            // Calculate total pages based on data length and items per page
            this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
          
            // Update paginated data and page window
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
    this.filteredData = this.data.filter((item) =>
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase())
    );
     // Update pagination after filtering
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page after search
    this.updatePaginatedData();
    this.updatePageWindow();
  }

  sortDataByTime(): void {
    console.log("Sorting data",this.filteredData)
    this.filteredData.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    console.log("Sorted data",this.filteredData)
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.updatePaginatedData();
    this.updatePageWindow();
  }

  onSortByTime(): void {

    this.sortDataByTime();
    
  }
  dropdownOpen = false;
  selectedFormat: 'json' | 'csv' | null = null;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  

  downloadData(format: 'json' | 'csv'): void {
    const token = localStorage.getItem('token'); // Adjust this based on how you store your token
    if (this.dataName && token) {
      const headers = { Authorization: `Bearer ${token}` }; // Include the token in the headers
      this.http
        .get(
          `https://asia-south1-ads-ai-101.cloudfunctions.net/card_api/viewdata/${this.dataName}?format=${format}`,
          { responseType: 'blob', headers }
        )
        .subscribe(
          (blob) => {
            const fileExtension = format === 'json' ? 'json' : 'csv';
            const fileName = `${this.dataName}.${fileExtension}`;
            saveAs(blob, fileName);
            this.dropdownOpen = false;
          },
          (error) => {
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

   // Pagination methods
   updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
      this.updatePageWindow(); // Update page window when moving to a new page
    }
  }

  updatePageWindow(): void {
    // Adjust the window of visible pages
    const halfWindow = Math.floor(this.maxPagesToShow / 2);
    
    if (this.totalPages <= this.maxPagesToShow) {
      // If total pages are less than or equal to max pages to show, show all pages
      this.startPage = 1;
      this.endPage = this.totalPages;
    } else if (this.currentPage <= halfWindow) {
      // If current page is near the start, show first 10 pages
      this.startPage = 1;
      this.endPage = this.maxPagesToShow;
    } else if (this.currentPage + halfWindow >= this.totalPages) {
      // If current page is near the end, show last 10 pages
      this.startPage = this.totalPages - this.maxPagesToShow + 1;
      this.endPage = this.totalPages;
    } else {
      // Otherwise, show a window of pages centered around the current page
      this.startPage = this.currentPage - halfWindow;
      this.endPage = this.currentPage + halfWindow;
    }
  }

  onPrevious(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  onNext(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  onFirst(): void {
    this.goToPage(1);
  }

  onLast(): void {
    this.goToPage(this.totalPages);
  }

}
