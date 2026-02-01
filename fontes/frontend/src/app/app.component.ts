import { Component, OnInit } from '@angular/core'; 
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { TitleService } from './shared/services/title.service'; 
import { ThemeService } from './shared/services/theme.service';
@Component({ 
  selector: 'app-root', 
  templateUrl: './app.component.html', 
  styleUrls: ['./app.component.scss'] 
}) 
export class AppComponent implements OnInit {  
  title = 'Osteo'; 

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset) 
  .pipe( 
    map(result => result.matches), 
    shareReplay() 
  ); 

constructor(
  private breakpointObserver: BreakpointObserver,
  private titleService: TitleService,
  private themeService: ThemeService
) {}  

  ngOnInit() {  
    this.titleService.setTitle(this.title); 
    this.themeService.init();
  } 
} 
