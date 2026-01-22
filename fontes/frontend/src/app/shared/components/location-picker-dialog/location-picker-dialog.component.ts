import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as L from 'leaflet';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-location-picker-dialog',
  templateUrl: './location-picker-dialog.component.html',
  styleUrls: ['./location-picker-dialog.component.scss']
})
export class LocationPickerDialogComponent {
  private map: any;
  private marker: any;
  selectedLocation: { lat: number, lng: number, quadrant?: string };

  constructor(
    public dialogRef: MatDialogRef<LocationPickerDialogComponent>,
    private translocoService: TranslocoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    // Defina a latitude e longitude de São Paulo
    const saoPauloLatLng: [number, number] = [-23.5505, -46.6333];
    
    // Inicializa o mapa com o foco em São Paulo
    this.map = L.map('map').setView(saoPauloLatLng, 10); // Zoom 10 para mais detalhes
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      const quadrant = this.getQuadrant(lat, lng);
      this.selectedLocation = { lat, lng, quadrant };
  
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
  
      this.marker = L.marker([lat, lng]).addTo(this.map);
    });
  
    // Adicione um marcador padrão em São Paulo
    this.marker = L.marker(saoPauloLatLng).addTo(this.map);
    this.selectedLocation = { lat: saoPauloLatLng[0], lng: saoPauloLatLng[1], quadrant: this.getQuadrant(saoPauloLatLng[0], saoPauloLatLng[1]) };
  }
  

  getQuadrant(lat: number, lng: number): string {
    const latQuadrant = lat >= 0 ? 'N' : 'S';
    const lngQuadrant = lng >= 0 ? 'E' : 'W';
    return `${latQuadrant}${lngQuadrant}`;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  confirmLocation(): void {
    console.log('Selected location:', this.selectedLocation);
    this.dialogRef.close(this.selectedLocation);
  }
}