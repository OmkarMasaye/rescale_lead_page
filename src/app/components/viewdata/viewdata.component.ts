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
    this.http.get<any[]>(`https://asia-south1-ads-ai-101.cloudfunctions.net/card_api/viewdata/${this.dataName}`).subscribe(
      data => {
        this.data = data;
      },
      error => {
        console.error('Failed to load data:', error);
      }
    );
  }

  downloadData(format: 'json' | 'csv'): void {
    if (this.dataName) {
      this.http.get(`http://localhost:5000/viewdata/${this.dataName}?format=${format}`, { responseType: 'blob' }).subscribe(
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
      console.error('Data name is null or undefined, cannot download data');
    }
  }
}