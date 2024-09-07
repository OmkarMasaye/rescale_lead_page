import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-viewdata',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './viewdata.component.html',
  styleUrl: './viewdata.component.css'
})
export class ViewdataComponent implements OnInit {
  dataName?: string;
  data: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
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
      const headers = { 'Authorization': `Bearer ${token}` }; // Include the token in the headers
      this.http.get<any[]>(`https://asia-south1-ads-ai-101.cloudfunctions.net/card_api/viewdata/${this.dataName}`, { headers }).subscribe(
        data => {
          this.data = data;
        },
        error => {
          console.error('Failed to load data:', error);
        }
      );
    } else {
      console.error('Data name or token is null or undefined, cannot load data');
    }
  }
  

  downloadData(format: 'json' | 'csv'): void {
    const token = localStorage.getItem('token'); // Adjust this based on how you store your token
    if (this.dataName && token) {
      const headers = { 'Authorization': `Bearer ${token}` }; // Include the token in the headers
      this.http.get(`https://asia-south1-ads-ai-101.cloudfunctions.net/card_api/viewdata/${this.dataName}?format=${format}`, { responseType: 'blob', headers }).subscribe(
        blob => {
          const fileExtension = format === 'json' ? 'json' : 'csv';
          const fileName = `${this.dataName}.${fileExtension}`;
          saveAs(blob, fileName);
        },
        error => {
          console.error('Failed to download data:', error);
        }
      );
    } else {
      console.error('Data name or token is null or undefined, cannot download data');
    }
  }
  
}