import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './Components/layout/layout.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule, LayoutComponent],
})
export class AppComponent {
  title = 'Mon Application';
}
